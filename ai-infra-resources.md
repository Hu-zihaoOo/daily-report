# AI Infra（AI 基础设施）学习资料整理

> 本资料收集整理了 AI 基础设施相关的学习资源，涵盖架构、工具、部署优化、MLOps 和大模型基础设施等方向。

---

## 📚 目录
1. [AI 基础设施架构](#1-ai-基础设施架构)
2. [主流框架和工具](#2-主流框架和工具)
3. [模型部署和推理优化](#3-模型部署和推理优化)
4. [MLOps 和流水线](#4-mlops-和流水线)
5. [大型语言模型基础设施](#5-大型语言模型基础设施)

---

## 1. AI 基础设施架构

### 入门级

| 标题（中英文） | 来源链接 | 描述 | 难度 |
|----------------|----------|------|------|
| **AI Infrastructure Tutorial & Best Practices** / AI 基础设施教程与最佳实践 | [Nexla](https://nexla.com/ai-infrastructure/) | 全面介绍数据存储、处理、训练、推理硬件和模型部署的关键概念和最佳实践 | 入门 |
| **AI Data Pipeline Architecture: How AI Models are Built and Deployed** / AI 数据管道架构：AI 模型如何构建和部署 | [VAST Data](https://www.vastdata.com/blog/ai-data-pipeline-architecture) | 讲解 AI 数据管道架构，包括训练负载分布、检查点窗口和模型仓库 | 入门 |
| **AI Infrastructure Explained: How to Build Scalable LLM and ML Systems** / AI 基础设施解析：如何构建可扩展的 LLM 和 ML 系统 | [Splunk](https://www.splunk.com/en_us/blog/learn/ai-infrastructure.html) | 介绍 AI 优化的数据湖架构，适用于大规模数据摄取、特征生成和训练 | 入门 |
| **Cognee Academy - Learn AI data infrastructure** / Cognee 学院 - 学习 AI 数据基础设施 | [Cognee](https://www.cognee.ai/academy/chapter-1/ai-infrastructure-hidden-engine) | 从云平台到端到端 AI 管道的基础知识，适合初学者 | 入门 |
| **【AI系统】推理系统介绍** | [博客园](https://www.cnblogs.com/ZOMI/articles/18560797) | 中文入门教程，介绍推理系统的基本概念和应用场景 | 入门 |

### 中级

| 标题（中英文） | 来源链接 | 描述 | 难度 |
|----------------|----------|------|------|
| **Building AI Infrastructure: A Practical Guide** / 构建 AI 基础设施：实践指南 | [Mirantis](https://www.mirantis.com/blog/build-ai-infrastructure-your-definitive-guide-to-getting-ai-right/) | 深入探讨 Kubernetes 自动扩展、CI/CD 流水线和监控 | 中级 |
| **AI Data Infrastructure: Components, Challenges & Best Practices** / AI 数据基础设施：组件、挑战与最佳实践 | [lakeFS](https://lakefs.io/blog/ai-data-infrastructure/) | 讲解训练和推理管道的优化，以及云原生服务的应用 | 中级 |
| **【AI系统】推理系统架构** | [博客园](https://www.cnblogs.com/ZOMI/articles/18560833) | 基于 NVIDIA Triton Inference Server 深入探讨推理系统架构 | 中级 |
| **模型推理服务工具综述** | [知乎](https://zhuanlan.zhihu.com/p/721395381) | 中文深度文章，综述各类模型推理服务工具 | 中级 |

### 高级

| 标题（中英文） | 来源链接 | 描述 | 难度 |
|----------------|----------|------|------|
| **AI Infrastructure | Google Cloud** / AI 基础设施 | [Google Cloud](https://cloud.google.com/ai-infrastructure) | 谷歌云官方文档，介绍 GPU、TPU、CPU 选择和 Vertex AI 托管基础设施 | 高级 |
| **超大规模 AI 基础设施建设实践，极致释放算力效能** | [知乎](https://zhuanlan.zhihu.com/p/1948713405029516726) | 中文深度文章，介绍万卡集群推理场景优化和全栈运维体系 | 高级 |
| **更快、更准确的 NVIDIA AI 推理** | [NVIDIA](https://www.nvidia.cn/solutions/ai/inference/) | NVIDIA 官方关于 NIM 推理微服务的技术文档 | 高级 |

---

## 2. 主流框架和工具

### 入门级

| 标题（中英文） | 来源链接 | 描述 | 难度 |
|----------------|----------|------|------|
| **Kubeflow** / Kubeflow 官方网站 | [Kubeflow](https://www.kubeflow.org/) | Kubeflow 官方主页，介绍如何在 Kubernetes 上自动化部署 ML 工作流 | 入门 |
| **Kubeflow on Kubernetes: Architecture** / Kubernetes 上的 Kubeflow：架构 | [KodeKloud](https://kodekloud.com/blog/running-ai-ml-workloads-on-kubernetes-using-kubeflow-a-beginners-guide/) | 初学者指南，探索 Kubernetes 和 Kubeflow 如何协同工作 | 入门 |
| **Introduction to AI/ML Toolkits with Kubeflow (LFS147)** / Kubeflow AI/ML 工具包介绍 | [Linux Foundation](https://training.linuxfoundation.org/training/introduction-to-ai-ml-toolkits-with-kubeflow-lfs147/) | Linux Foundation 免费课程，适合初学者 | 入门 |
| **Ray for ML Infrastructure — Ray 2.54.0** / Ray 机器学习基础设施 | [Ray Docs](https://docs.ray.io/en/latest/ray-air/getting-started.html) | Ray 官方文档入门指南 | 入门 |

### 中级

| 标题（中英文） | 来源链接 | 描述 | 难度 |
|----------------|----------|------|------|
| **Architecture | Kubeflow** / Kubeflow 架构 | [Kubeflow Docs](https://www.kubeflow.org/docs/started/architecture/) | 深入了解 Kubeflow 架构和数据准备步骤 | 中级 |
| **Build a ML platform with Kubeflow and Ray on GKE** / 在 GKE 上用 Kubeflow 和 Ray 构建 ML 平台 | [Google Cloud Blog](https://cloud.google.com/blog/products/ai-machine-learning/build-a-ml-platform-with-kubeflow-and-ray-on-gke) | 实战教程，演示如何部署 Kubeflow 和 Ray | 中级 |
| **Kubernetes for ML: A Developer's Practical Guide** / 面向开发者的 Kubernetes ML 实践指南 | [DiscoPosse](https://discoposse.com/2025/12/01/kubernetes-for-ml-a-developers-practical-guide/) | 开发者指南，涵盖 Kubeflow、Ray、MLflow 集成 | 中级 |

### 高级

| 标题（中英文） | 来源链接 | 描述 | 难度 |
|----------------|----------|------|------|
| **Kubeflow 1.9: New Tools for Model Management and Training Optimization** / Kubeflow 1.9：模型管理和训练优化新工具 | [Kubeflow Blog](https://blog.kubeflow.org/kubeflow-1.9-release/) | Kubeflow 1.9 发布说明，包含与 Ray、Seldon、BentoML、KServe 的集成更新 | 高级 |

---

## 3. 模型部署和推理优化

### 入门级

| 标题（中英文） | 来源链接 | 描述 | 难度 |
|----------------|----------|------|------|
| **Quick Start Guide — NVIDIA TensorRT** / NVIDIA TensorRT 快速入门指南 | [NVIDIA Docs](https://docs.nvidia.com/deeplearning/tensorrt/latest/getting-started/quick-start-guide.html) | TensorRT 官方快速入门指南 | 入门 |
| **【AI系统】推理引擎架构** | [知乎](https://zhuanlan.zhihu.com/p/6873362107) | 中文文章，介绍推理引擎的优化阶段、模型转换和压缩技术 | 入门 |
| **AI 模型落地关键概念解读：推理引擎/ModelOps/MaaS/AI Agent…** | [知乎](https://zhuanlan.zhihu.com/p/1969814369027208039) | 中文入门解读，介绍 AI 模型落地关键概念 | 入门 |

### 中级

| 标题（中英文） | 来源链接 | 描述 | 难度 |
|----------------|----------|------|------|
| **LLM Inference ( vLLM , TGI, TensorRT )** / LLM 推理（vLLM、TGI、TensorRT） | [Medium](https://medium.com/@pratik.vyas_10544/llm-inference-vllm-tgi-tensorrt-17872f7df1f5) | 对比介绍 vLLM、TGI 和 TensorRT 三种推理框架 | 中级 |
| **Deploying Quantized LLMs with ONNX Runtime** / 使用 ONNX Runtime 部署量化 LLM | [APXML](https://apxml.com/courses/quantized-llm-deployment/chapter-4-optimizing-deploying-quantized-llms/deployment-onnx-runtime) | 教程，讲解如何使用 ONNX Runtime 部署量化模型 | 中级 |
| **Comparing GenAI Inference Engines: TensorRT-LLM, vLLM, Hugging Face TGI, and LMDeploy** / 对比 GenAI 推理引擎 | [Hacker News](https://news.ycombinator.com/item?id=43620472) | 深度对比 TensorRT-LLM、vLLM、TGI 和 LMDeploy 的性能 | 中级 |

### 高级

| 标题（中英文） | 来源链接 | 描述 | 难度 |
|----------------|----------|------|------|
| **GitHub - NVIDIA/TensorRT-LLM** / NVIDIA TensorRT-LLM 官方仓库 | [GitHub](https://github.com/NVIDIA/TensorRT-LLM) | TensorRT LLM 官方仓库，提供 Python API 和优化推理运行时 | 高级 |
| **GitHub - NVIDIA/Model-Optimizer** / NVIDIA 模型优化器 | [GitHub](https://github.com/NVIDIA/Model-Optimizer) | 统一的 SOTA 模型优化库，支持量化、剪枝、蒸馏、推测解码等 | 高级 |
| **[D] Comparing GenAI Inference Engines: TensorRT-LLM, vLLM, Hugging Face TGI, and LMDeploy** | [Reddit](https://www.reddit.com/r/MachineLearning/comments/1juay0t/d_comparing_genai_inference_engines_tensorrtllm/) | 来自 NLP Cloud 的深度基准测试和对比分析 | 高级 |

---

## 4. MLOps 和流水线

### 入门级

| 标题（中英文） | 来源链接 | 描述 | 难度 |
|----------------|----------|------|------|
| **Machine Learning Operations** / 机器学习运维 | [ml-ops.org](https://ml-ops.org/content/mlops-principles) | MLOps 基础原理介绍，三个自动化级别 | 入门 |
| **What is MLOps? | Databricks** / 什么是 MLOps？ | [Databricks](https://databricks.com/glossary/mlops) | Databricks 的 MLOps 术语表解释 | 入门 |
| **What is MLOps? - Machine Learning Operations Explained - AWS** / 什么是 MLOps？ | [AWS](https://aws.amazon.com/what-is/mlops/) | AWS 官方 MLOps 解释 | 入门 |
| **什么是机器学习运维(MLOps)？** | [IBM](https://www.ibm.com/cn-zh/think/topics/mlops) | IBM 中文 MLOps 介绍 | 入门 |
| **AI全景技术深度培训 - 第八章：MLOps流程概览** | [知乎](https://zhuanlan.zhihu.com/p/1935405947636917618) | 中文 MLOps 流程概览 | 入门 |

### 中级

| 标题（中英文） | 来源链接 | 描述 | 难度 |
|----------------|----------|------|------|
| **MLOps: Continuous delivery and automation pipelines in machine learning** / MLOps：机器学习中的持续交付和自动化流水线 | [Google Cloud](https://cloud.google.com/architecture/mlops-continuous-delivery-and-automation-pipelines-in-machine-learning) | Google Cloud 架构中心的 MLOps 详细指南 | 中级 |
| **MLOps Fundamentals | DataCamp** / MLOps 基础 | [DataCamp](https://www.datacamp.com/tracks/mlops-fundamentals) | DataCamp 的 MLOps 基础课程，涵盖 CI/CD、实验跟踪、特征存储等 | 中级 |
| **MLOps-工程指南-全** | [博客园](https://www.cnblogs.com/apachecn/p/19071248) | 中文 MLOps 工程指南完整翻译 | 中级 |
| **MLOps-实践指南-全** | [博客园](https://www.cnblogs.com/apachecn/p/19227026) | 中文 MLOps 实践指南完整翻译 | 中级 |
| **MLOps：机器学习中的持续交付和自动化流水线** | [Google Cloud 中文](https://docs.cloud.google.com/architecture/mlops-continuous-delivery-and-automation-pipelines-in-machine-learning?hl=zh-cn) | Google Cloud MLOps 中文文档 | 中级 |

### 高级

| 标题（中英文） | 来源链接 | 描述 | 难度 |
|----------------|----------|------|------|
| **MLOps Toys | A Curated List of Machine Learning Projects** / MLOps 工具精选 | [tools.mlops.community](https://tools.mlops.community/) | MLOps 社区工具精选列表 | 高级 |
| **Feature Storing - MLOps Guide** / 特征存储 - MLOps 指南 | [MLOps Guide](https://mlops-guide.github.io/MLOps/FeatureStore/) | 特征存储详细指南 | 高级 |
| **Amazon SageMaker Feature Store for machine learning (ML)** / Amazon SageMaker 特征存储 | [AWS](https://aws.amazon.com/sagemaker/ai/feature-store/) | AWS SageMaker 特征存储官方文档 | 高级 |
| **GitHub - liguodongiot/ai-system: LLM/MLOps/LLMOps** | [GitHub](https://github.com/liguodongiot/ai-system) | 中文开源项目，包含特征存储、MLflow、模型推理等 | 高级 |
| **人工智能研发运营体系（MLOps）实践指南** | [中国信通院](https://pdf.dfcfw.com/pdf/H3_AP202303231584507841_1.pdf?1679609306000.pdf=) | 中国信息通信研究院 MLOps 实践指南（PDF） | 高级 |

---

## 5. 大型语言模型基础设施

### 入门级

| 标题（中英文） | 来源链接 | 描述 | 难度 |
|----------------|----------|------|------|
| **In-depth guide to fine-tuning LLMs with LoRA and QLoRA** / 使用 LoRA 和 QLoRA 微调 LLM 深度指南 | [Mercity Research](https://www.mercity.ai/blog-post/guide-to-fine-tuning-llms-with-lora-and-qlora/) | 详细介绍 LoRA、QLoRA 和 AWQ 量化技术 | 入门 |
| **Understanding LoRA, QLoRA, and Quantization in LLM Fine-Tuning** / 理解 LLM 微调中的 LoRA、QLoRA 和量化 | [Medium](https://medium.com/@anonhossain1710/understanding-lora-qlora-and-quantization-in-llm-fine-tuning-b9a7e88e6d4d) | 通俗易懂地解释 LoRA、QLoRA 原理 | 入门 |
| **Easily Train a Specialized LLM: PEFT, LoRA, QLoRA, LLaMA-Adapter, and More** / 轻松训练专用 LLM：PEFT、LoRA、QLoRA 等 | [Substack](https://cameronrwolfe.substack.com/p/easily-train-a-specialized-llm-peft) | 介绍各种参数高效微调方法 | 入门 |
| **大模型微调技术 --＞ LoRA 系列之 QLoRA (省资源能手)** | [CSDN](https://blog.csdn.net/weixin_46034279/article/details/143606719) | 中文 QLoRA 入门教程 | 入门 |
| **[大模型微调技术] LoRA、QLoRA、QA-LoRA 原理笔记** | [知乎](https://zhuanlan.zhihu.com/p/671089942) | 中文 LoRA 系列技术原理笔记 | 入门 |

### 中级

| 标题（中英文） | 来源链接 | 描述 | 难度 |
|----------------|----------|------|------|
| **GitHub - artidoro/qlora: QLoRA: Efficient Finetuning of Quantized LLMs** / QLoRA 官方仓库 | [GitHub](https://github.com/artidoro/qlora) | QLoRA 官方实现，包含 Colab 笔记本和示例代码 | 中级 |
| **Maximizing Efficiency: Fine‑Tuning Large Language Models with LoRA and QLoRA on Runpod** / 最大化效率：在 Runpod 上使用 LoRA 和 QLoRA 微调大语言模型 | [Runpod](https://www.runpod.io/articles/guides/maximizing-efficiency-fine-tuning-large-language-models-with-lora-and-qlora-on-runpod) | 实战教程，使用 PEFT 和 bitsandbytes 库 | 中级 |
| **Mastering QLoRa : A Deep Dive into 4-Bit Quantization and LoRa Parameter Efficient Fine-Tuning** / 精通 QLoRA：深入 4 位量化和 LoRA 参数高效微调 | [manalelaidouni.github.io](https://manalelaidouni.github.io/4Bit-Quantization-Models-QLoRa.html) | 深入讲解 NF4 量化和 LoRA 理论 | 中级 |
| **GitHub - liguodongiot/llm-action** | [GitHub](https://github.com/liguodongiot/llm-action) | 中文开源项目，分享大模型相关技术原理和实战经验 | 中级 |
| **LoRA和QLoRA微调语言大模型：数百次实验后的见解** | [智源社区](https://hub.baai.ac.cn/view/32023) | 中文文章，分享数百次实验后的 LoRA/QLoRA 见解 | 中级 |
| **使用 QLoRA 微调 Llama2 — TorchTune 文档** | [PyTorch 中文](https://pytorch.ac.cn/torchtune/0.1/tutorials/qlora_finetune.html) | PyTorch 官方 QLoRA 微调教程中文版 | 中级 |

### 高级

| 标题（中英文） | 来源链接 | 描述 | 难度 |
|----------------|----------|------|------|
| **[2305.14314] QLoRA: Efficient Finetuning of Quantized LLMs** / QLoRA 原论文 | [arXiv](https://arxiv.org/abs/2305.14314) | QLoRA 原始论文，介绍 4 位 NormalFloat 和双重量化 | 高级 |
| **QA-LoRA: Quantization-Aware Low-Rank Adaptation of Large Language Models** / QA-LoRA：大语言模型的量化感知低秩适应 | [OpenReview](https://openreview.net/forum?id=WvFoJccpo8) | QA-LoRA 论文，结合量化和 LoRA | 高级 |
| **14｜以Llama 3为例讲透QLoRA量化+微调-大模型应用开发实战** | [极客时间](https://time.geekbang.org/column/article/784500) | 极客时间付费专栏，深度讲解 Llama 3 QLoRA | 高级 |
| **yiqiwanya/Llama_factory** | [GitLink](https://www.gitlink.org.cn/yiqiwanya/Llama_factory) | LLaMA Factory 多 GPU 分布式训练 | 高级 |
| **QLoRA首页、文档和下载** | [OSCHINA](https://www.oschina.net/p/qlora) | QLoRA 中文开源社区页面 | 高级 |

---

## 🎯 学习路径建议

### 初学者路径（1-3 个月）
1. 先了解 AI 基础设施架构基础知识
2. 学习 Kubernetes 基础
3. 熟悉 Kubeflow 和 MLflow 入门
4. 了解基本的 MLOps 概念

### 进阶路径（3-6 个月）
1. 深入学习模型部署和推理优化
2. 实践 Ray 分布式训练
3. 掌握特征存储和实验跟踪
4. 动手实践 LLM 微调（LoRA/QLoRA）

### 高级路径（6 个月以上）
1. 研究万卡集群架构
2. 深入推理引擎优化
3. 大规模 MLOps 平台建设
4. 前沿量化和分布式训练技术

---

## 📌 说明

- 本资料定期更新，欢迎贡献
- 难度标签基于内容深度和前置知识要求
- 中文资源优先标注，适合国内学习者
- 官方文档和开源项目优先收录

---

**最后更新：** 2026年3月
**维护者：** AI Infra 学习资料整理项目
