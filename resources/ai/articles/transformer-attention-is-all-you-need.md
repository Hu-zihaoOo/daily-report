# Attention Is All You Need - Transformer 原论文

**标题:** Attention Is All You Need
**作者:** Vaswani et al.
**来源:** NeurIPS 2017
**链接:** https://arxiv.org/abs/1706.03762
**PDF:** https://papers.neurips.cc/paper/7181-attention-is-all-you-need.pdf
**发布日期:** 2017-06-12

## 核心要点

1. **抛弃 RNN/CNN，只用 Attention**
   - 完全基于自注意力机制（Self-Attention）
   - 允许并行计算，解决 RNN 顺序依赖问题

2. **Transformer 架构**
   - Encoder-Decoder 结构
   - 多层（6层）Encoder 和 Decoder
   - 每层包含 Multi-Head Attention 和 Feed-Forward Network

3. **Multi-Head Attention**
   - 8个并行的注意力头
   - 每个头学习不同的表示子空间
   - 最终拼接所有头的输出

4. **Position-wise Feed-Forward**
   - 两个线性层，中间 ReLU 激活
   - FFN(x) = max(0, xW1 + b1)W2 + b2

5. **Positional Encoding**
   - 因为 Attention 本身无序，需要显式注入位置信息
   - 使用正弦/余弦函数编码不同位置

## 关键公式

### Scaled Dot-Product Attention
```
Attention(Q, K, V) = softmax(QK^T / √d_k)V
```

### Multi-Head Attention
```
MultiHead(Q, K, V) = Concat(head1, ..., headh)W_O
where headi = Attention(QW_i^Q, KW_i^K, VW_i^V)
```

## 相关资源

- **Wikipedia:** https://en.wikipedia.org/wiki/Attention_Is_All_You_Need
- **Paper Walkthrough:** https://towardsdatascience.com/paper-walkthrough-attention-is-all-you-need-80399cdc59e1/

## 个人笔记

这是现代 NLP 和大语言模型的基石论文，后续所有 GPT、BERT 等模型都基于此架构。

---
*归档日期: 2026-03-12*
*更新日期: 2026-03-12*
