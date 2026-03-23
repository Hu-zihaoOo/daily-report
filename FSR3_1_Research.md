# AMD FidelityFX Super Resolution 3.1 (FSR 3.1) 技术研究报告

> 生成时间: 2026-03-23
> 归类: Graphics / Upscaling / Temporal Reconstruction

---

## 一、概述

**AMD FidelityFX Super Resolution 3.1** 是 AMD 在 2024 年 GDC 大会上正式发布的空间/时间超分辨率重建技术，是 FSR 3.0 的重大升级版本。它包含两个核心组件：

1. **超分辨率Upscaling（空间+时间重建）** — 将低分辨率渲染帧升频到目标分辨率
2. **帧生成 Frame Generation** — 在已有帧之间插入中间帧，成倍提升帧率

FSR 3.1 的核心设计哲学：**无需 ML 硬件加速，支持 AMD/NVIDIA 跨平台**，属于 compute-based（计算型）算法。

> ⚠️ **注意**: FSR 3.1 代码已开源（MIT License），源码托管于 [GPUOpen-Effects/FidelityFX-FSR](https://github.com/GPUOpen-Effects/FidelityFX-FSR) 和 [FidelityFX-SDK](https://github.com/GPUOpen-LibrariesAndSDKs/FidelityFX-SDK)。

---

## 二、技术架构总览

```
[游戏渲染管线]
        ↓
  1. 低分辨率渲染 (Render at reduced res)
        ↓
  2. FSR 3.1 Upscaling (时序重建升频)
        ↓  ──────────────────────→ [帧生成插值帧]
        ↓                              ↑
  3. 上屏 (Present) ←──────────────────┘
```

FSR 3.1 的管线分为**四大步骤**：

| 步骤 | 内容 | 说明 |
|------|------|------|
| Step 1 | FSR 3 Upscaling | 与 FSR 2 集成类似，通过 FidelityFX API 集成 |
| Step 2 | Swapchain | 使用 AMD FidelityFX API 的 DX12 或 Vulkan Frame Generation Swapchains |
| Step 3 | Frame Generation | 调用 Frame Generation Prepare Dispatch API |
| Step 4 | UI Handling | 三种 UI 合成方式（必选） |

---

## 三、超分辨率升频原理（Upscaling）

### 3.1 与 FSR 1/FSR 2 的本质区别

| 版本 | 类型 | 依赖数据 | 核心算法 |
|------|------|----------|----------|
| FSR 1 | 纯空间（Spatial） | 仅当前帧 | Edge-directed spatial upscaling + 锐化 |
| FSR 2 | 时间+空间（Temporal） | 当前帧 + 历史帧 + 运动矢量 | Temporal AA + 升频 |
| **FSR 3.1** | **时间+空间（Temporal）** | 当前帧 + 历史帧 + 运动矢量 + 深度缓冲 | **增强的时间重建 + 细节保持** |

FSR 1 是纯空间升频（无时间反馈），FSR 2 首次引入时间反馈，FSR 3.1 在此基础上大幅改进质量。

### 3.2 时间重建算法（Temporal Upscaling）

FSR 3.1 超分辨率的核心是**时序反馈重建算法**，其工作原理如下：

#### 输入数据

| 输入 | 分辨率 | 格式 | 必需性 |
|------|--------|------|--------|
| Color Buffer（颜色缓冲） | 渲染分辨率 | 应用指定 | ✅ 必须 |
| Depth Buffer（深度缓冲） | 渲染分辨率 | 1x FLOAT | ✅ 必须（建议 inverted infinite） |
| Motion Vectors（运动矢量） | 渲染分辨率 | 2x FLOAT | ✅ 必须 |
| Reactive Mask | 渲染分辨率 | R8_UNORM | ✅ 强烈建议 |
| Transparency & Composition Mask | 渲染分辨率 | R8_UNORM | 可选 |
| Exposure | 1x1 | R32_FLOAT | 可选（若开启自动曝光） |

#### 时间重建核心步骤

```
Step 1: 相机抖动（Camera Jitter / Sub-pixel Jittering）
  应用在投影矩阵上，使渲染图像产生亚像素抖动
  ↓
Step 2: 运动矢量投影（Motion Vector Reprojection）
  将当前帧像素根据运动矢量投影到历史帧对应位置
  ↓
Step 3: 混合重建（History Blending / Accumulation）
  将历史帧信息与当前帧信息按权重混合
  权重由深度一致性、颜色一致性、reactive mask 决定
  ↓
Step 4: 细节恢复（Detail Restoration）
  通过自适应锐化（RCAS - Robust Contrast Adaptive Sharpening）恢复纹理细节
  ↓
Step 5: 帧间稳定性控制（Temporal Stability Clamping）
  使用椭圆体约束（Ellipsoid）替代 AABB 约束颜色 clamp
  减少闪烁（flickering）和鬼影（ghosting）
```

#### Reactive Mask 的关键作用

Reactive Mask 是 FSR 3.1 质量提升的关键之一：

- **Alpha-blended 对象**（粒子、半透明物体）不会写深度和运动矢量
- Reactive Mask 用 `[0.0..1.0]` 告知 FSR 哪些像素应增加当前帧权重、减少历史依赖
- 实践建议：写入 alpha 混合时的 alpha 值，最大值钳制到 ~0.9

#### 相机抖动（Camera Jitter）

FSR 依赖亚像素抖动实现超分辨率重建：
- 渲染时在投影矩阵中施加微小偏移
- FidelityFX API 提供工具函数自动计算抖动矩阵
- 抖动 pattern 通常为 N-rooks（平铺）排列

#### 相机跳切检测（Camera Jump Cuts）

当检测到相机突然大幅位移（jump cut）时：
- FSR 3.1 会自动重置历史缓冲，避免历史帧造成的重影
- 开发者可通过 API 主动通知跳切事件

### 3.3 质量模式与缩放比例

| 模式 | 每维缩放比 | 面积缩放比 | 4K 输出时输入分辨率 |
|------|-----------|-----------|---------------------|
| **Native AA** | 1.0x | 1.0x | 3840×2160（无升频） |
| **Quality** | 1.5x | 2.25x | 2560×1440 |
| **Balanced** | 1.7x | 2.89x | 2259×1270 |
| **Performance** | 2.0x | 4.0x | 1920×1080 |
| **Ultra Performance** | 3.0x | 9.0x | 1280×720 |

> **Native AA 模式**：FSR 3.1 新增的纯抗锯齿模式，不做升频，配合帧生成可在原生分辨率下获得插帧效果。

### 3.4 FSR 3.1 的升频质量改进（vs FSR 3.0）

根据 AMD 官方披露，FSR 3.1 在升频质量上相比 3.0 有以下改进：

1. **细节保持更好（Better Detail Preservation）** — 减少纹理模糊
2. **时序不稳定性降低（Less Temporal Instability）** — 减少闪烁
3. **新增直接 Letterbox 支持**
4. **Reactive Mask 质量改善** — 对排除对象的处理更优
5. **新 Disoccluded Pixel 鬼影减少**（3.1.4 引入）

---

## 四、帧生成原理（Frame Generation）

### 4.1 核心技术：光流估计（Optical Flow）

FSR 3 的帧生成核心技术是从 **AMD Fluid Motion Frames (AFMF)** 演进而来的**光流估计**：

```
光流估计 = 分析连续两帧之间每个像素的运动方向和幅度
    ↓
利用光流矢量 + 运动矢量 → 合成中间插值帧
```

FSR 3 帧生成使用 **ML 加速算法**（在 AMD Instinct GPU 上训练），但运行时**不需要 ML 硬件**（在 RDNA/GCN 上通过 compute shader 运行）。

### 4.2 FSR 3.0 的架构局限

FSR 3.0 的帧生成与升频强耦合：
- 帧生成依赖 FSR 升频处理后的运动矢量/深度数据
- 导致帧生成只能与 FSR 升频配合使用，无法对接第三方升频器

### 4.3 FSR 3.1 的关键架构变化：解耦

FSR 3.1 最大的架构变化是**帧生成与升频解耦**：

```
FSR 3.0:
  [游戏渲染] → [FSR 升频] → [处理后的 MV/Depth] → [帧生成] → [输出]
                                          ↑ 强耦合

FSR 3.1:
  [游戏渲染] → [FSR 升频] → [输出]               （独立工作）
                 ↓
  [原始 MV + Depth] → [Frame Generation Prepare] → [帧生成] → [输出]
                                          ↑ 解耦，可接入第三方升频器
```

FSR 3.1 新增 `FrameGenerationPrepare` 函数：
- 接收**升频前**的原始运动矢量 + 深度数据
- 为帧生成预处理所需输入
- 使得帧生成可与**任意升频器**配合使用（包括 DLSS、NIS）

### 4.4 帧生成的数学原理

帧生成的核心是**帧插值（Frame Interpolation）**：

已知：
- $I_t$：t 时刻渲染帧
- $I_{t+1}$：t+1 时刻渲染帧  
- $V_{mv}$：游戏提供的运动矢量（像素级）
- $V_{of}$：光流（Optical Flow）估计的像素运动

求解：$I_{t+\alpha}$（$\alpha \in (0,1)$，通常 $\alpha=0.5$）

$$I_{t+\alpha}(x) = f(I_t, I_{t+1}, V_{mv}, V_{of}, \alpha)$$

其中 $f$ 是 FSR 的帧生成重建函数，核心步骤：

1. **双向运动估计**：结合前向光流（$I_t \to I_{t+1}$）和后向光流
2. **运动矢量融合**：将游戏运动矢量与光流矢量混合
3. **时间自适应采样**：根据 $\alpha$ 调整历史帧贡献权重
4. **时间稳定性约束**：对插值结果做时序约束，减少闪烁

### 4.5 帧生成性能数据

FSR 3.1 在 AMD RX 7900 XTX (4K) 上的实测帧生成开销：

| 质量模式 | 升频耗时 | 帧生成耗时（最多） |
|----------|---------|-------------------|
| Native AA | 1.7 ms | 2.4 ms |
| Quality | 1.0 ms | 1.7 ms |
| Performance | 0.8 ms | 1.5 ms |

> 数据来源：AMD GPUOpen 官方 Performance 数据，RX 7900 XTX + Ryzen 9 7950X

---

## 五、FidelityFX API 架构

FSR 3.1 强制通过 **FidelityFX API** 集成（不再支持旧版直接 DLL 路径）：

### 5.1 API 设计原则

```
导出函数类型：
  - 创建 (Create)
  - 销毁 (Destroy)
  - 查询 (Query)
  - 配置 (Configure)
  - 调度 (Dispatch)

→ 与 Vulkan 设计相似，支持未来扩展
```

### 5.2 Context 创建流程

```cpp
// 1. 注册 Backend（DX12 / Vulkan）
ffxRegisterBackend(D3D12, backendCallbacks);
ffxRegisterBackend(Vulkan, vulkanCallbacks);

// 2. 创建 Upscale Context
ffxCreateContext(context, &upscaleDesc, &upscaleContext);

// 3. 每帧 Dispatch
ffxDispatch(context, upscaleContext, &dispatchDesc);

// 4. 销毁
ffxDestroyContext(context, upscaleContext);
```

### 5.3 显存需求

FSR 3.1 升频工作集（Working Set）显存占用：

| 分辨率 | 模式 | 显存需求 |
|--------|------|---------|
| 3840×2160 | Quality (1.5x) | ~292 MB |
| 3840×2160 | Balanced (1.7x) | ~256 MB |
| 3840×2160 | Performance (2x) | ~226 MB |
| 2560×1440 | Quality (1.5x) | ~134 MB |
| 1920×1080 | Performance (2x) | ~61 MB |

> 数据来源：AMD RX 9070XT，实测值可能有±差异

---

## 六、Vulkan 支持

FSR 3.1 新增 Vulkan 实现（FSR 3.0 仅支持 DX12）。Vulkan 与 DX12 的差异：

| 差异点 | DX12 | Vulkan |
|--------|------|--------|
| Swapchain | DXGI | VK_KHR_swapchain |
| 帧生成 | ✅ | ✅（需要额外应用层数据） |
| Async Compute | ✅ | ✅ |

---

## 七、与竞品的核心差异

### 7.1 FSR 3.1 vs NVIDIA DLSS 3

| 特性 | AMD FSR 3.1 | NVIDIA DLSS 3 |
|------|------------|---------------|
| ML 训练 | 是（训练） | 是（训练+推理） |
| ML 推理硬件 | 不需要 | 需要（Tensor Core） |
| 运动矢量依赖 | 游戏提供 | 游戏+DLSS 内部估计 |
| 光流硬件 | 不需要 | 需要（Optical Flow Accelerator） |
| 帧生成解耦 | ✅（3.1） | ❌（与 DLSS 2 耦合） |
| 平台支持 | AMD + NVIDIA + 主机 | 仅 NVIDIA RTX |
| 开源 | ✅（MIT） | ❌（闭源） |

> DLSS 3 需要 RTX 40 系列的光流加速器，FSR 3.1 通过 compute shader 实现，兼容更广（RX 5000 系列及以上，GTX 900 系列亦可运行帧生成）。

### 7.2 FSR 3.1 vs FSR 3.0

| 改进点 | FSR 3.0 | FSR 3.1 |
|--------|---------|---------|
| 帧生成与升频耦合 | ✅（耦合） | ❌（解耦） |
| Vulkan 支持 | ❌ | ✅ |
| Reactive Mask 质量 | 基础 | 增强 |
| 帧生成支持第三方升频 | ❌ | ✅ |
| FidelityFX API | ❌（DLL直调） | ✅（必须） |
| 稳定性改进 | — | 时序稳定性增强 |

---

## 八、集成注意事项

### 8.1 必须满足的条件

1. **最低帧率要求**：启用帧生成前，原生帧率应 ≥ 60 FPS（30 FPS 以下绝对禁止）
2. **运动矢量覆盖**：所有不透明、Alpha-tested、Alpha-blended 物体都应写入运动矢量
3. **Reactive Mask**：强烈建议提供，尤其是粒子系统
4. **深度缓冲配置**：推荐使用 inverted infinite depth buffer
5. **UI 合成**：三种方案之一（必选）

### 8.2 UI 合成三种方案

| 方案 | 描述 |
|------|------|
| 方案 A | 将 UI 渲染到独立 Render Target，在生成帧上再合成 |
| 方案 B | 帧生成后回调引擎重新渲染 UI |
| 方案 C | 通过比较有无 UI 的帧差检测 UI 区域 |

### 8.3 帧率限制与 VRR

| 设置 | 效果 |
|------|------|
| 帧生成 + VRR OFF + V-Sync OFF | 可能出现撕裂 |
| 帧生成 + VRR ON + V-Sync ON | 无撕裂，帧率受限于 1/2 刷新率 |
| 帧生成 + VRR ON + V-Sync OFF | 最佳流畅体验（推荐） |
| AMD Anti-Lag 2 | FSR 3.1.1+ 支持，建议关闭（帧率 pacing 问题） |

---

## 九、版本历史

| 版本 | 时间 | 关键变化 |
|------|------|---------|
| FSR 3.0 | 2023年 | 首次发布，帧生成与升频耦合 |
| FSR 3.1 | 2024年3月 | 解耦帧生成、FidelityFX API、Vulkan支持 |
| FSR 3.1.1 | 2024年 | 支持 Anti-Lag 2，修复多项问题 |
| FSR 3.1.2 | 2024年 | 支持 Xbox GDK，帧扭曲纹理（frame distortion texture）支持 |
| FSR 3.1.3 | 2024年 | 混合 spin lock pacing 支持 |
| FSR 3.1.4 | 2025年 | 减少 disoccluded ghosting，支持 FSR Redstone ML 帧生成 |
| FSR 3.1.5 | 2026年 | 修复负 RCAS 输出问题 |

---

## 十、参考资料

- [AMD GPUOpen - FSR 3 官方页面](https://gpuopen.com/fidelityfx-super-resolution-3/)
- [AMD GPUOpen - FSR 3.1 源码发布博客](https://gpuopen.com/learn/amd_fsr_3_1_release/)
- [AMD GPUOpen - FSR SDK 手册（超分辨率升频）](https://gpuopen.com/manuals/fsr_sdk/techniques/super-resolution-upscaler/)
- [AMD FSR Frame Generation 官方页面](https://gpuopen.com/amd-fsr-framegeneration/)
- [GitHub - GPUOpen-Effects/FidelityFX-FSR](https://github.com/GPUOpen-Effects/FidelityFX-FSR)
- [GitHub - GPUOpen-LibrariesAndSDKs/FidelityFX-SDK](https://github.com/GPUOpen-LibrariesAndSDKs/FidelityFX-SDK)
- [DirectX Developer Blog - DirectSR Preview FSR 3.1](https://devblogs.microsoft.com/directx/directsr-preview-fsr-3-1-upscaler/)
- [PC Gamer - AMD FSR 3.1 技术解析](https://www.pcgamer.com/hardware/amd-promises-less-fuzziness-and-flickering-from-improved-fsr-31-upscaling-algorithm/)

---

## 附：FSR 3.1 技术栈全景图

```
┌─────────────────────────────────────────────────────┐
│                    游戏应用层                         │
├─────────────────────────────────────────────────────┤
│  渲染管线：低分辨率帧 + 运动矢量 + 深度缓冲 + Reactive │
│       ↓              ↓              ↓              │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │
│  │ 升频器    │  │帧生成准备 │  │   UI 合成器      │  │
│  │ FSR 3.1  │  │FG Prepare │  │（三种方案之一）  │  │
│  └────┬─────┘  └────┬─────┘  └──────────────────┘  │
│       ↓              ↓                               │
│  ┌──────────┐  ┌──────────┐                        │
│  │ 升频输出  │  │ 插值帧    │                        │
│  │(Present) │  │(Present) │                        │
│  └────┬─────┘  └────┬─────┘                        │
│       ↓              ↓                               │
│  ┌─────────────────────────────────────────────┐    │
│  │       FidelityFX API (DX12 / Vulkan)        │    │
│  └─────────────────────────────────────────────┘    │
│                        ↓                             │
│  ┌─────────────────────────────────────────────┐    │
│  │        GPU Compute / Shader 执行             │    │
│  │  - EASU (Edge Adaptive Sampling Upconversion) │    │
│  │  - RCAS (Robust Contrast Adaptive Sharpening) │    │
│  │  - Optical Flow + Frame Interpolation        │    │
│  └─────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

---

*本报告由 AI 助手整理，基于 AMD GPUOpen 官方公开技术文档*
