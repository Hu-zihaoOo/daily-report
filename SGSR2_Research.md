# Qualcomm SGSR 2 (Snapdragon Game Super Resolution 2) 技术研究报告

> 生成时间: 2026-03-23
> 归类: Graphics / Real-time Rendering / Temporal Upscaling

---

## 一、概述

**Snapdragon Game Super Resolution 2（SGSR 2）** 是高通 Snapdragon Game Studios 开发的第二代时序超分辨率升频技术，专门针对 **Adreno GPU 瓦片架构（Tile Architecture）** 优化，目标平台为**移动设备**（Android、iOS、WebGL、Nintendo Switch）。

SGSR 2 的核心设计目标：
> **在移动 GPU 功耗受限的前提下，以更低功耗和更快速度，实现优于 TAAU 的时序升频质量**

与 FSR 3.1、XeSS 3 的重要区别：**SGSR 2 是纯升频方案，不包含帧生成（Frame Generation）**，专注于时序抗锯齿+升频。

开源托管于 [GitHub SnapdragonGameStudios/snapdragon-gsr](https://github.com/SnapdragonGameStudios/snapdragon-gsr)（BSD 3-Clause License）。

---

## 二、技术架构总览

### 2.1 版本对比

| 版本 | 类型 | 核心算法 | 时间 |
|------|------|---------|------|
| **SGSR 1** | 空间升频（Spatial） | 12-tap Lanczos 升频 + 自适应锐化，单 Pass | 2023 |
| **SGSR 2** | 时序升频（Temporal） | Convert + Upscale 双 Pass（含时序历史累积） | 2024.10 |

SGSR 1 是纯空间升频（仅用当前帧），SGSR 2 引入时间反馈，质量和性能均大幅超越前代。

### 2.2 三种实现变体

| 变体 | Shader 类型 | 质量 | 性能 | 适用场景 |
|------|-----------|------|------|---------|
| **2-pass-fs** | 2 个 Fragment Shader | 中 | 最快 | 移动端 / VR/XR（推荐） |
| **2-pass-cs** | 2 个 Compute Shader | 中 | 快 | 移动端 / VR/XR |
| **3-pass-cs** | 3 个 Compute Shader | 最高 | 较慢 | PC/Console / 高端移动 |

> 3-pass 版本比 2-pass 多一个 **Activate Pass**，质量更高但计算量更大。

---

## 三、算法流程详解

### 3.1 2-Pass 架构（推荐，移动端首选）

```
┌─────────────────────────────────────────────────────┐
│                   输入（Render 分辨率）                  │
│  InputColor + InputDepth + InputVelocity              │
└──────────────────────┬──────────────────────────────┘
                       ↓
  ┌─────────────────────────────────────────────┐
  │           Pass 1: Convert Pass               │
  │  - 颜色 → YCoCg 格式转换                      │
  │  - 深度扩张（3×3 邻域取最近深度）               │
  │  - 运动矢量生成 / 深度重投影                   │
  │  - Alpha Mask 生成（半透明物体）               │
  └──────────────────────┬──────────────────────┘
                         ↓
              MotionDepthClipBuffer (R) + Colorluma (R)
                         ↓
  ┌─────────────────────────────────────────────┐
  │           Pass 2: Upscale Pass               │
  │  - Lanczos 9-tap 采样获取 min/max/variance   │
  │  - 历史帧颜色按 min/max/variance 钳制          │
  │  - 升频颜色与钳制历史颜色插值混合              │
  └──────────────────────┬──────────────────────┘
                         ↓
              SceneColorOutput (Display) + HistoryOutput
```

### 3.2 3-Pass 架构（最高质量）

```
┌─────────────────────────────────────────────────────┐
│                   输入（Render 分辨率）                  │
│  InputOpaqueColor + InputColor + InputDepth + InputVelocity
└──────────────────────┬──────────────────────────────┘
                       ↓
  ┌─────────────────────────────────────────────┐
  │         Pass 1: Convert Pass                 │
  │  - 半透明物体 Alpha Mask 计算                  │
  │  - 颜色 → YCoCg 转换                         │
  │  - 深度扩张 + 运动矢量重投影                   │
  └──────────────────────┬──────────────────────┘
                         ↓
              Colorluma (R) + MotionDepthAlphaBuffer (R)
                         ↓
  ┌─────────────────────────────────────────────┐
  │         Pass 2: Activate Pass                │
  │  - 当前深度与重投影历史深度计算 DepthClip      │
  │  - Luma 历史处理                             │
  │  - None Edge + Luma Highlighted Bit 计算      │
  └──────────────────────┬──────────────────────┘
                         ↓
         MotionDepthClipAlphaBuffer (R) + LumaHistory (R)
                         ↓
  ┌─────────────────────────────────────────────┐
  │         Pass 3: Upscale Pass                 │
  │  - Lanczos 9-tap → min/max/variance          │
  │  - 历史颜色钳制 + 插值混合                     │
  └──────────────────────┬──────────────────────┘
                         ↓
              SceneColorOutput (Display) + HistoryOutput
```

### 3.3 核心算法细节

#### YCoCg 颜色空间转换

Convert Pass 将输入颜色从 RGB 转为 YCoCg 格式：
- **Y**：亮度（Luma）
- **Co**：橙色色度分量
- **Cg**：绿色色度分量

YCoCg 优势：允许在亮度通道和色度通道独立进行滤波和钳制，减少色度走样。

#### Lanczos 9-Tap 升频滤波

Upscale Pass 使用 **Lanczos 滤波器**对 9 个样本进行采样：
```
对 YCoCg Color 图像的 9 个邻域样本应用 Lanczos 滤波
→ 得到 Y/Co/Cg 各通道的 min / max / variance
```

#### 时序历史混合（Temporal Blending）

Upscale Pass 的核心重建逻辑：

```
Step 1: 对当前帧应用 Lanczos 9-tap → 得到升频颜色 C_up
Step 2: 将历史帧颜色 C_hist 按 min/max/variance 钳制 → C_clamped
Step 3: 在 C_clamped 和原始历史帧颜色之间插值 → C_hist_blended
Step 4: 最终颜色 = lerp(C_up, C_hist_blended, 历史权重)
```

这一机制有效解决了 TAAU 的核心问题：
- **鬼影（Ghosting）**：通过 min/max 钳制检测历史帧中不一致的颜色
- **闪烁（Flicker）**：Luma 历史累积平滑时序变化
- **走样（Aliasing）**：Lanczos 滤波替代简单双线性升频

#### 深度扩张（Depth Dilate）

Convert Pass 对深度缓冲进行 3×3 邻域扩张，取最近深度值：
- 解决深度不连续处（如物体边缘）的运动矢量缺失问题
- 为没有提供运动矢量的静态物体提供 fallback 重投影

---

## 四、输入输出规格

### 4.1 2-Pass 输入

| 输入 | 分辨率 | 格式 | 说明 |
|------|--------|------|------|
| InputColor | Render | RGBA | 当前帧颜色缓冲 |
| InputDepth | Render | D24S8 | 当前帧深度缓冲 |
| InputVelocity | Render | RGBA | 运动矢量（Clip Space） |
| PrevHistory | Display | RGBA | 上一帧 HistoryOutput |

> **运动矢量编码**：`out = velocity * 0.2495 + 32767.0f / 65535.0f`
> 仅对动态物体计算；静态物体传零。

### 4.2 3-Pass 额外输入

| 输入 | 说明 |
|------|------|
| InputOpaqueColor | 绘制半透明物体之前的不透明颜色（可选，不需透明度时等同于 InputColor） |

### 4.3 UBO 参数（所有变体共享）

```glsl
vec2  renderSize;          // 渲染分辨率
vec2  displaySize;         // 目标（屏幕）分辨率
vec2  renderSizeRcp;       // 1.0 / renderSize
vec2  displaySizeRcp;       // 1.0 / displaySize
vec2  jitterOffset;         // 抖动偏移 [-0.5, 0.5]，Halton 序列
vec4  clipToPrevClip[4];    // 当前Clip空间→前一Clip空间矩阵
                            // = prev_view_proj * inv_current_vp
float preExposure;          // 曝光值：previous_pre_exposure / current_pre_exposure
float cameraFovAngleHor;    // 水平 FOV
float cameraNear;           // 近裁面
float minLerpContribution;  // 历史插值权重（2-pass 专用）
uint  bSameCamera;          // 相机是否与上一帧相同（阈值判断）
uint  reset;                // 是否重置历史（如跳切时）
```

---

## 五、性能数据

测试平台：**Snapdragon 8 Gen 3**（最高 GPU 频率）

| 变体 | 2.0x（630×1400→1260×2800） | 1.7x（740×1648→1260×2800） | 1.5x（840×1866→1260×2800） |
|------|------|------|------|
| 2-pass-CS | 1.801 ms | 1.910 ms | 1.998 ms |
| **2-pass-FS** | **0.905 ms** | **1.024 ms** | **1.107 ms** |
| 3-pass-CS | 2.015 ms | 2.199 ms | 2.397 ms |

> 2-pass-FS（Fragment Shader）在 2.0x 升频下仅需 **0.905ms**，极其适合移动端帧时间预算。

---

## 六、与竞品对比

### 6.1 SGSR 2 vs TAAU（Temporal AA Upscaling）

TAAU 是最简单的时序升频方案，SGSR 2 对其的改进：

| 问题 | TAAU | SGSR 2 |
|------|------|--------|
| 鬼影 | 严重（历史累积无检测） | min/max 钳制有效抑制 |
| 闪烁 | 明显（历史权重不稳定） | Luma 历史平滑处理 |
| 移动端功耗 | 低，但质量差 | 专门为 Adreno 瓦片架构优化 |
| 速度 | 快 | 2-pass-FS 比 TAAU 更快 |

### 6.2 SGSR 2 vs FSR 3.1 / XeSS 3

| 特性 | SGSR 2 | FSR 3.1 | XeSS 3 |
|------|--------|---------|---------|
| 类型 | 时序升频 | 时序升频+帧生成 | AI 升频+帧生成 |
| 帧生成 | ❌ | ✅（最高 2x） | ✅（最高 4x） |
| 平台 | Adreno（移动为主） | 跨平台 | 跨平台 |
| ML 训练 | ❌ | ❌ | ✅（XeSS-SR） |
| 计算类型 | 通用 Shader | Compute Shader | Compute Shader + ML |
| 开源 | ✅（BSD-3） | ✅（MIT） | ✅ |
| 最低硬件 | Adreno 6xx+ | RX 5000 / SM 6.4 | Arc / SM 6.4 |
| 目标设备 | 移动 / VR | PC / Console | PC / 移动 |

> **定位差异**：FSR 3.1 和 XeSS 3 是通用 PC/主机方案，SGSR 2 是专攻移动端低功耗场景的垂直方案。

---

## 七、版本历史

| 版本 | 日期 | 关键变化 |
|------|------|---------|
| SGSR 1.0.0 | 2023-06-29 | 首次发布，12-tap Lanczos 单 Pass 升频 |
| SGSR 1.1.0 | 2024-01-29 | 改进质量 |
| **SGSR 2.0.0** | **2024-10-21** | **时序重建，Convert+Upscale 双 Pass，YCoCg + Lanczos 9-tap** |

---

## 八、集成方式

### 8.1 Shader 代码位置

```
snapdragon-gsr/sgsr/v2/
├── include/glsl_2_pass/   ← 2-pass FS/CS 变体
└── include/glsl_3_pass/   ← 3-pass CS 变体（最高质量）
```

### 8.2 Vulkan 示例

完整集成示例：[adreno-gpu-vulkan-code-sample-framework/samples/sgsr2](https://github.com/SnapdragonStudios/adreno-gpu-vulkan-code-sample-framework/tree/main/samples/sgsr2)

### 8.3 Unreal Engine 插件

高通提供官方 Unreal Engine 插件，支持所有主流 UE 版本：
- [GitHub - SnapdragonGameStudios/snapdragon-game-plugins-for-unreal-engine](https://github.com/SnapdragonStudios/snapdragon-game-plugins-for-unreal-engine)
- Unity Asset Store: SGSR 2 Mobile（首个 WebGL 支持的升频器）

### 8.4 深度与坐标系注意事项

- **Vulkan UV Y轴方向**与 NDC 相反
  - Convert Pass：`ScreenPos = vec2(2.0 * ViewportUV.x - 1.0, 1.0 - 2.0 * ViewportUV.y)`
  - Activate/Upscale Pass：`PrevUV = vec2(-0.5 * motion.x + ViewportUV.x, 0.5 * motion.y + ViewportUV.y)`
- **Inverted Depth（Reverse-Z）**：Near=1, Far=0 时需修改 Convert Pass 的 NearstZ 判断（min→max）和 depth clip 条件

---

## 九、相机跳切处理

当场景发生大幅相机跳切（Camera Cut）时，需主动重置历史缓冲：

```cpp
// 检测相机是否与上一帧相同（阈值判断）
bool is_camera_still = IsCameraStill(curr_VP, prev_VP, threshold=1e-5);
uint bSameCamera = is_camera_still ? 1 : 0;

// 跳切时设置 reset = 1
uint reset = IsCameraCut() ? 1 : 0;
```

---

## 十、参考资源

- [GitHub - SnapdragonGameStudios/snapdragon-gsr](https://github.com/SnapdragonGameStudios/snapdragon-gsr)
- [Qualcomm Developer Blog - Introducing SGSR 2](https://www.qualcomm.com/developer/blog/2024/10/introducing-snapdragon-game-super-resolution-2)
- [ProAndroidDev - Enhance Your Game Graphics with SGSR 2](https://proandroiddev.com/enhance-your-game-graphics-with-snapdragon-game-super-resolution-2-8484598b1391)
- [Neowin - Qualcomm announces SGSR 2](https://www.neowin.net/news/qualcomm-announces-snapdragon-game-super-resolution-2-with-several-significant-improvements/)
- [Unreal Engine 插件](https://github.com/SnapdragonStudios/snapdragon-game-plugins-for-unreal-engine)

---

## 附：SGSR 2 技术栈全景图

```
┌─────────────────────────────────────────────────────┐
│                 游戏渲染管线 @ Render 分辨率            │
│  InputColor + InputDepth + InputVelocity              │
├─────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────┐   │
│  │          Convert Pass (Render Resolution)     │   │
│  │  • RGB → YCoCg 颜色空间转换                    │   │
│  │  • 深度 3×3 邻域扩张（Depth Dilate）           │   │
│  │  • 运动矢量重投影 / Alpha Mask 计算             │   │
│  └─────────────────────┬────────────────────────┘   │
│                        ↓                             │
│              MotionDepthClipBuffer + Colorluma        │
│                        ↓                             │
│  ┌──────────────────────────────────────────────┐   │
│  │          Activate Pass (仅 3-pass)            │   │
│  │  • DepthClip 计算（当前深度 vs 历史重投影深度）  │   │
│  │  • Luma 历史处理 + None Edge + Highlight 计算   │   │
│  └─────────────────────┬────────────────────────┘   │
│                        ↓                             │
│              MotionDepthClipAlphaBuffer + LumaHistory │
│                        ↓                             │
│  ┌──────────────────────────────────────────────┐   │
│  │          Upscale Pass (Display Resolution)    │   │
│  │  • Lanczos 9-tap 升频 → min/max/variance     │   │
│  │  • 历史帧颜色钳制（min/max/variance）          │   │
│  │  • 时序插值混合 → SceneColorOutput            │   │
│  └──────────────────────────────────────────────┘   │
│                        ↓                             │
│         SceneColorOutput + HistoryOutput (Ping-Pong)  │
└─────────────────────────────────────────────────────┘
```

---

*本报告由 AI 助手整理，基于 Qualcomm/Snapdragon Game Studios 官方 GitHub 源码与开发者文档*
