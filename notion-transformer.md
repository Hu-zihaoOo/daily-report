# Transformer 架构原理与实现

## 核心资料

### 原论文
- **Attention Is All You Need** - Vaswani et al. (2017)
  - https://arxiv.org/abs/1706.03762

### 入门教程
- **The Illustrated Transformer** - Jay Alammar (2025 更新版)
  - http://jalammar.github.io/illustrated-transformer/
  - 2025 年新增动画课程
  
- **Architecture and Working of Transformers in Deep Learning** - GeeksforGeeks (2025-10)
  - https://www.geeksforgeeks.org/deep-learning/architecture-and-working-of-transformers-in-deep-learning/
  
- **How Transformers Work: A Detailed Exploration** - DataCamp (2024-01)
  - https://www.datacamp.com/tutorial/how-transformers-work
  
- **Dive into Deep Learning: The Transformer Architecture**
  - https://d2l.ai/chapter_attention-mechanisms-and-transformers/transformer.html

### 中文教程
- **探秘Transformer系列之（1）：注意力机制** - 罗西的思考
  - https://www.cnblogs.com/rossiXYZ/p/18705809
  
- **从头开始构建 Transformer: 注意力机制** - 阿里云开发者社区 (2024-10)
  - https://developer.aliyun.com/article/1500168

### 课程讲义
- **Transformer and Newer Architectures** - CMU Deep Learning (Spring 2025)
  - https://deeplearning.cs.cmu.edu/S25/document/slides/lec19.transformer.pdf
  - 内容包括：Transformer 架构、改进版本、多模态应用、参数高效微调

### 代码实现
- **Transformer from Scratch (PyTorch)**
  - https://github.com/hyunwoongko/transformer
- **annotated-transformer** (带注释的 PyTorch 实现)
  - https://github.com/harvardnlp/annotated-transformer

### 最新进展与优化
- **Performer** - 谷歌大脑 (线性复杂度注意力)
  - 通过随机正交特性实现无偏估计，资源需求线性增长
  - 相关报道：https://www.linkresearcher.com/theses/ebd1472f-a6b3-49c7-ae34-a25eedd0e08e/
  
- **AttentionViz** - 哈佛大学 (注意力可视化工具)
  - 全局视角可视化 Transformer 注意力机制
  - 通过查询-键向量联合嵌入分析多序列间的全局模式
  - https://hub.baai.ac.cn/view/26690

---
*整理日期: 2026-03-13*
