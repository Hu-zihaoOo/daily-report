# Intel XeSS 3 技术研究报告

> 生成时间: 2026-03-23
> 归类: Graphics / Real-time Rendering / AI Upscaling

---

## 一、概述

**Intel XeSS 3 (Xe Super Sampling 3)** 是 Intel 第3代 AI 超分辨率与帧生成技术，包含三个独立组件：

| 组件 | 名称 | 功能 |
|------|------|------|
| **XeSS-SR** | XeSS Super Resolution | AI 驱动的时空超分辨率升频 |
| **XeSS-FG** | XeSS Frame Generation | AI 驱动的多帧插值（最多 3x~4x 输出） |
| **XeLL** | Xe Low Latency | 输入延迟降低（与 XeSS-FG 配合） |

XeSS 3 的核心设计理念：**基于 AI 深度学习，运行时依赖 DP4a/SM 6.4 通用计算，无需专用 Tensor Core**。开源托管于 [GitHub intel/xess](https://github.com/intel/xess)。

> **版本说明**: XeSS 3.0 = XeSS 3（SDK 命名），内部版本演进：XeSS 1.0 → 1.3 → 2.0 → 3.0。XeSS 3.0 随 Intel Battlemage GPU（Arc B系列）发布于 2025 年底，**XeSS 3.1 新增 3x/4x 多帧生成**，2026年初全面下放到所有 Arc GPU。

---

## 二、技术架构总览

```
┌──────────────────────────────────────────────────────┐
│                    游戏渲染管线                        │
│  渲染 @ 低分辨率 → 颜色缓冲 + 运动矢量 + 深度缓冲         │
└──────────────────┬───────────────────────────────────┘
                   ↓
         ┌─────────────────────┐
         │    XeSS-SR 升频      │  ← AI 升频 + TAA 替代
         │  (时空重建 + 锐化)   │
         └──────────┬──────────┘
                    ↓
    ┌───────────────┴───────────────┐
    ↓                               ↓
┌───────────────┐           ┌───────────────┐
│  XeLL 延迟降低 │           │ XeSS-FG 帧生成 │
│               │           │ (AI 帧插值)    │
└───────┬───────┘           └───────┬───────┘
        ↓                           ↓
        └──────────┬───────────────┘
                   ↓
              [显示输出]
```

XeSS-FG 需配合 XeLL 使用以缓解延迟，XeSS-SR 与 XeSS-FG 可独立开启。

---

## 三、XeSS-SR 超分辨率原理

### 3.1 定位：替代 TAA 的 AI 时序超采样

XeSS-SR 替换渲染管线中的 **Temporal Anti-Aliasing (TAA)** 阶段，而非事后处理。其本质是：

> **AI 时序超采样（Temporal Super Sampling）** = TAA 思路 + 神经网络重建

传统 TAA 问题：
- 历史帧 warp 后与当前帧的颜色/深度不一致 → 鬼影（ghosting）
- 邻域钳制（neighborhood clamping）等启发式方法在高细节区域效果差
- 造成过度模糊、闪烁、鬼影

XeSS-SR 改进：
- 用**训练好的神经网络**替代 TAA 的启发式判断
- 重建亚像素细节 + 时间累积，同时完成升频与抗锯齿

### 3.2 算法流程

```
Step 1: 相机亚像素抖动 (Camera Jitter)
  在投影矩阵施加 subpixel jitter（范围 [-0.5, 0.5]）
  每帧生成新的采样位置，保证静态场景也能时间收敛
  抖动公式：
    ProjectionMatrix[2][0] += Jx * 2.0 / InputWidth
    ProjectionMatrix[2][1] -= Jy * 2.0 / InputHeight
  ↓
Step 2: 低分辨率渲染
  在抖动后的亚像素偏移位置渲染场景
  ↓
Step 3: 运动矢量 + 深度提供
  运动矢量：当前帧→前一帧的像素级位移
  XeSS-SR 接受低分辨率 MV（默认）或高分辨率 MV
  低分辨率 MV 由 XeSS-SR 内部升频 + Dilated（扩张）
  ↓
Step 4: 时间重建（Temporal Reconstruction）
  历史帧（上一帧输出）根据 MV warp 到当前帧位置
  神经网络对当前帧亚像素样本 + 历史 warp 结果进行融合重建
  输出：抗锯齿的升频颜色缓冲
```

### 3.3 输入数据要求

| 输入 | 必需 | 格式 | 说明 |
|------|------|------|------|
| 抖动偏移 (Jitter) | ✅ | 2个 float | 相机亚像素偏移 [-0.5, 0.5] |
| 颜色缓冲 | ✅ | R16G16B16A16_FLOAT / R11G11B10_FLOAT / R8G8B8A8_UNORM | 建议 HDR |
| 运动矢量 | ✅ | R16G16_FLOAT | 当前→前一帧，像素单位 |
| 深度缓冲 | 条件必需 | D32_FLOAT / D24_UNORM | 仅当使用低分辨率 MV 时 |
| 曝光值 | 可选 | float | HDR 内容建议提供 |
| 响应像素掩码 (RPM) | 可选 | R8_UNORM | 处理粒子等无 MV 对象 |

> **Dilated Motion Vectors**: 运动矢量表示邻域（如 3×3）内最前景表面的运动，用于解决深度不连续问题（类似 TAA 的做法）。

### 3.4 抖动序列（Jitter Sequence）

XeSS-SR 要求高质量准随机序列（Halton sequence 即可），序列长度必须满足：

$$\text{min\_jitter\_length} = \text{Halton\_length} \times \text{scale\_factor}$$

| 质量预设 | 缩放比 | 最小抖动序列长度 |
|----------|--------|-----------------|
| Native AA | 1.0x | 1 |
| Ultra Quality Plus | 1.3x | 14 |
| Ultra Quality | 1.5x | 23 |
| Quality | 1.7x | 29 |
| Balanced | 2.0x | 41 |
| Performance | 2.3x | 54 |
| Ultra Performance | 3.0x | 72 |

### 3.5 质量预设与缩放比（XeSS 1.3+）

| 预设 | 缩放比 | 4K 输出输入分辨率 |
|------|--------|-----------------|
| Native AA | 1.0x | 3840×2160 |
| Ultra Quality Plus | 1.3x | 2946×1657 |
| Ultra Quality | 1.5x | 2560×1440 |
| Quality | 1.7x | 2259×1270 |
| Balanced | 2.0x | 1920×1080 |
| Performance | 2.3x | ~1657×933 |
| Ultra Performance | 3.0x | 1280×720 |

> XeSS 1.3 相比 1.2 大幅提升了各预设的缩放比（相同质量输入更高），同时新增 Ultra Quality Plus (1.3x) 和 Ultra Performance (3.0x)。

### 3.6 Mip Bias

为保持目标分辨率的纹理细节，XeSS-SR 要求额外的 mip bias：

$$\text{mipBias} = \log_2(\text{outputWidth} / \text{inputWidth})$$

例如 Balanced 模式 2.0x 缩放 → mip bias = -1.0

---

## 四、XeSS-FG 多帧生成原理

### 4.1 核心技术：AI 帧插值（Frame Interpolation）

XeSS-FG 是 Intel 在 XeSS 3.0/3.1 中引入的**多帧生成**技术，相比 FSR 3 的 1x 帧生成（插1帧），XeSS 3.1 支持**最多 3x~4x 帧输出**（插2~3帧）。

**工作原理（基于官方文档）：**

```
XeSS-FG 接收两帧真实帧（F_t, F_{t+1}）
         ↓
1. 提取运动矢量（Object Motion）+ 深度缓冲
2. 计算光流网络（Optical Flow Network）
3. 在两真实帧之间生成 N 帧插值帧
```

核心数学表达：
- 给定 $F_t$、$F_{t+1}$、运动矢量 $V_{mv}$、深度 $D$
- 生成中间帧 $F_{t+\alpha}$，其中 $\alpha \in (0, 1)$（XeSS 3.1 支持多个 $\alpha$ 值）

### 4.2 光流网络架构

XeSS-FG 使用**光流网络（Optical Flow Network）**：
- 输入：运动矢量 + 深度缓冲（作为几何先验）
- 输出：稠密光流场（dense optical flow field）
- 结合游戏运动矢量与 AI 估计的光流，生成更准确的中间帧

> 关键优势：深度缓冲提供了几何先验，使 XeSS-FG 在复杂遮挡场景（disocclusion）下优于纯光流方法（如 FSR 3 的 AFMF 方案）。

### 4.3 多帧生成能力（XeSS 3.1）

| GPU 类型 | 最大插值帧数 | 输出倍率 |
|----------|------------|---------|
| Intel Arc（Battlemage+） | **最多 3 帧** | 最高 4x（1 real + 3 generated） |
| Intel Arc（Alchemist/Meteor Lake） | **最多 1 帧** | 2x |
| 非 Intel GPU（SM 6.4） | **仅 1 帧** | 2x |

> Arc Alchemist/Meteor Lake 上的 XeSS 3.1 多帧生成需要特定驱动支持。

### 4.4 性能目标

| 输入帧率 | 体验 | 说明 |
|----------|------|------|
| ≥ 40 FPS | 良好 | 适合入门级 |
| ≥ 60 FPS | 最佳 | 最低延迟+最流畅 |

### 4.5 XeLL 延迟降低

XeSS-FG 会延迟渲染帧的呈现（presentation），因此 XeLL 集成**必须**：

```
XeLL 工作流程：
  1. 应用渲染完当前帧 → 立即标记 XeLL marker（PRESENT_START）
  2. 帧提交到 XeSS-FG → XeLL 提前通知驱动"帧已就绪"
  3. 驱动优先调度 → 用户输入更早被感知
  4. 渲染帧/插值帧呈现在屏幕
  5. 标记 XeLL marker（PRESENT_END）
```

> XeLL 等效于 NVIDIA Reflex，仅与 XeSS-FG 配合使用，不支持其他帧生成方案。

---

## 五、三套实现方案（XeSS SDK 架构）

XeSS-SR 提供三种实现，通过 Dispatcher 自动选择：

| 实现 | 运行硬件 | 加速方式 |
|------|---------|---------|
| **Intel optimized** | Intel Arc / Iris Xe | Intel XMX（矩阵引擎） |
| **Cross-vendor HLSL** | 任何 SM 6.4 GPU（NVIDIA/AMD） | DP4a 指令加速 |
| **Driver-bundled** | 取决于驱动 | 驱动版本决定 |

### 5.1 DP4a 与 SM 6.4

DP4a（Dot Product 4 accumulated）是 SM 6.4 引入的整数矩阵乘法指令：
- 无需 Tensor Core，GTX 900 系列即可运行（需 SM 6.4）
- XeSS Cross-vendor 版本通过 DP4a 加速 ML 推理

### 5.2 三组件对比

| 组件 | 依赖关系 | 必需硬件 | 支持 API |
|------|---------|---------|---------|
| XeSS-SR | 独立 | SM 6.4 / Arc / Iris Xe | D3D12, D3D11, Vulkan |
| XeSS-FG | 依赖 XeLL | Arc discrete+ / 非Intel仅1帧 | D3D12 |
| XeLL | 独立 | Arc discrete+ | D3D12 |

---

## 六、XeSS 3 vs 竞品对比

### 6.1 XeSS 3 vs FSR 3.1

| 特性 | Intel XeSS 3 | AMD FSR 3.1 |
|------|-------------|-------------|
| 升频类型 | AI（ML 训练） | Compute（非 ML） |
| 帧生成最大倍率 | **4x**（3帧插值） | 2x（1帧插值） |
| 帧生成解耦 | ✅（独立 XeSS-FG） | ✅（3.1 解耦） |
| 跨厂商 | ✅（SM 6.4 DP4a） | ✅（无需特定硬件） |
| 最低帧率要求 | 40 FPS 推荐 | 60 FPS 推荐 |
| SDK 开源 | ✅（GitHub） | ✅（GPUOpen） |
| 最低硬件 | SM 6.4 GPU | RX 5000 系列 |
| 延迟方案 | XeLL（内置） | Anti-Lag 2（驱动） |

### 6.2 XeSS 3 vs NVIDIA DLSS 3

| 特性 | Intel XeSS 3 | NVIDIA DLSS 3 |
|------|-------------|---------------|
| 推理硬件 | DP4a（通用） | **Tensor Core（专用）** |
| 帧生成 | ✅（最高 4x） | ✅（最高 4x） |
| 帧生成解耦 | ✅ | ❌（与 DLSS 2 耦合） |
| 跨厂商 | ✅ | ❌（仅 RTX） |
| 开源 | ✅ | ❌ |
| 光流硬件 | 无（AI 估计） | OFA（Optical Flow Accelerator） |

---

## 七、集成要点

### 7.1 渲染管线位置

```
场景渲染（低分辨率 + 抖动）
    ↓
XeSS-SR 升频（替换 TAA）  ← 在后处理之前执行
    ↓
XeSS-FG 帧生成（如启用）
    ↓
XeLL 标记
    ↓
呈现（Proxy SwapChain）
```

### 7.2 UI 处理

XeSS-FG 提供两种 UI 策略：

| 模式 | 描述 | 质量 |
|------|------|------|
| **UI 插值（默认）** | AI 直接插值含 UI 的帧 | 依赖 AI 模型 |
| **UI 合成** | 分离 HUD-less + UI 纹理，分别插值再合成 | 更稳定，可处理复杂 UI |

UI 合成 4 种子模式：

| 模式 | HUD-less 纹理 | UI 纹理 |
|------|-------------|---------|
| AUTO | 可选 | 可选 |
| HUDLESS_UITEXTURE | ✅ 必需 | ✅ 必需 |
| BACKBUFFER_HUDLESS | ✅ 必需 | ❌ |
| BACKBUFFER_UITEXTURE | ❌ | ✅ 必需 |
| BACKBUFFER_HUDLESS_UITEXTURE | ✅ 必需 | ✅ 必需（+回退提取）|

### 7.3 动态分辨率支持

XeSS-SR 2.0 支持动态输入分辨率，`xessGetOptimalInputResolution()` 每帧可查询最佳输入尺寸。

### 7.4 显存管理

XeSS 3.0 新增**外部显存堆（External Memory Heap）**支持：
- 游戏引擎可共享已分配的 VRAM，避免 XeSS 预留独立显存池
- 减少显存碎片化
- 通过 `pTempBufferHeap` / `pTempTextureHeap` 参数传入

---

## 八、部署要求

### 8.1 运行时依赖

| 文件 | 说明 |
|------|------|
| `libxess.dll` | XeSS-SR + XeLL（D3D12/Vulkan） |
| `libxess_dx11.dll` | XeSS-SR（D3D11） |
| `libxess_fg.dll` | XeSS-FG |
| `msvcp140.dll` / `vcruntime140.dll` / `vcruntime140_1.dll` | MSVC 运行时 |

### 8.2 系统要求

- Windows 10/11 x64（10.0.19043+）
- D3D12：Intel Iris Xe+ 或 SM 6.4 GPU
- D3D11：Intel Arc+
- Vulkan：Intel Iris Xe+ 或支持 `shaderStorageImageWriteWithoutFormat` 的 GPU

---

## 九、XeSS 3 版本历史

| 版本 | 时间 | 关键变化 |
|------|------|---------|
| XeSS 1.0 | 2022年 | 首次发布，Arc 独占 |
| XeSS 1.3 | 2024年 | Ultra Quality Plus、Native AA、Ultra Performance 预设 |
| XeSS 2.0 | 2025年 | 外部显存堆支持、动态分辨率 |
| XeSS 3.0 | 2025年底 | XeSS-FG 多帧生成（最多 3 帧）、XeLL |
| XeSS 3.1 | 2026年 | 多帧生成下放至所有 Arc GPU、3x/4x 输出 |

---

## 十、插件与工具

- **Unreal Engine 插件**: [GitHub GameTechDev/XeSSUnrealPlugin](https://github.com/GameTechDev/XeSSUnrealPlugin)
- **Unity 插件**: [GitHub GameTechDev/XeSSUnityPlugin](https://github.com/GameTechDev/XeSSUnityPlugin) + [Unity Asset Store](https://assetstore.unity.com/packages/tools/utilities/intel-xess-plugin-for-unity-engine-311773)
- **XeSS Inspector**: [GitHub GameTechDev/XeSSInspector](https://github.com/GameTechDev/XeSSInspector) — 调试/可视化 XeSS 输入数据

---

## 附：XeSS 3 技术栈全景图

```
┌─────────────────────────────────────────────────────┐
│                  游戏应用层                          │
│  颜色缓冲 + 运动矢量 + 深度缓冲 + 曝光 + RPM          │
├──────────────────────────────────────────────────────┤
│  ┌────────────┐  ┌────────────┐  ┌────────────┐    │
│  │ XeSS-SR   │  │ XeSS-FG    │  │   XeLL     │    │
│  │ 升频+TAA  │  │ 多帧插值    │  │ 延迟降低   │    │
│  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘    │
│        ↓                ↓                ↓           │
│  ┌─────────────────────────────────────────────┐    │
│  │         XeSS 3 Proxy SwapChain (D3D12)       │    │
│  └─────────────────────────────────────────────┘    │
│                        ↓                             │
│  ┌─────────────────────────────────────────────┐    │
│  │        GPU 执行 (Compute Shader Passes)        │    │
│  │  ┌──────────────┐  ┌───────────────────┐    │    │
│  │  │ 时间重建网络  │  │ 光流插值网络       │    │    │
│  │  │ (XeSS-SR)   │  │ (XeSS-FG)         │    │    │
│  │  └──────────────┘  └───────────────────┘    │    │
│  └─────────────────────────────────────────────┘    │
│                        ↓                             │
│  ┌─────────────────────────────────────────────┐    │
│  │   硬件加速层                                  │    │
│  │   Intel XMX / DP4a (SM 6.4)                │    │
│  └─────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

---

## 参考资料

- [GitHub - intel/xess (XeSS 3 SDK)](https://github.com/intel/xess)
- [Intel XeSS 3 开发者主页](https://www.intel.com/content/www/us/en/developer/topic-technology/gamedev/xess.html)
- [XeSS-SR Developer Guide 2.0](https://github.com/intel/xess/blob/main/doc/xess_sr_developer_guide_english.md)
- [XeSS-FG Developer Guide 1.3](https://github.com/intel/xess/blob/main/doc/xess_fg_developer_guide_english.md)
- [PC Gamer - XeSS 3 多帧生成发布报道](https://www.pcgamer.com/hardware/graphics-cards/intel-announces-xess-3-with-multi-frame-generation-putting-it-ahead-of-amd-in-the-ai-powered-graphics-performance-race/)
- [PC Gamer - XeSS 3 SDK 发布](https://www.pcgamer.com/hardware/graphics-cards/intel-has-released-the-sdk-for-xess-3-so-hopefully-it-wont-be-long-before-arc-gpu-owners-get-in-on-native-multi-frame-gen-action/)
- [TechPowerUp - XeSS 3.1 Arc 全系列推送](https://www.pcgamer.com/hardware/graphics-cards/intel-has-now-rolled-out-xess-3-multi-frame-generation-to-every-arc-powered-gpu-after-its-first-foray-only-on-panther-lake/)

---

*本报告由 AI 助手整理，基于 Intel 官方 XeSS SDK GitHub 源码与开发者文档*
