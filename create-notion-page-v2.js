
const https = require('https');

const API_KEY = process.env.NOTION_API_KEY;
const PARENT_PAGE_ID = '0a169d1a-e4d0-45d3-9a85-cecff9b4ba9e';

const data = JSON.stringify({
  parent: { page_id: PARENT_PAGE_ID },
  properties: {
    title: {
      title: [
        {
          text: {
            content: "Transformer 架构原理与实现 (2026-03-13 更新)"
          }
        }
      ]
    }
  },
  children: [
    {
      object: "block",
      type: "heading_2",
      heading_2: {
        rich_text: [{ type: "text", text: { content: "核心资料" } }]
      }
    },
    {
      object: "block",
      type: "heading_3",
      heading_3: {
        rich_text: [{ type: "text", text: { content: "原论文" } }]
      }
    },
    {
      object: "block",
      type: "paragraph",
      paragraph: {
        rich_text: [
          { type: "text", text: { content: "Attention Is All You Need - Vaswani et al. (2017)" } },
          { type: "text", text: { content: "\n" } },
          { type: "text", text: { content: "https://arxiv.org/abs/1706.03762", link: { url: "https://arxiv.org/abs/1706.03762" } } }
        ]
      }
    },
    {
      object: "block",
      type: "heading_3",
      heading_3: {
        rich_text: [{ type: "text", text: { content: "入门教程" } }]
      }
    },
    {
      object: "block",
      type: "paragraph",
      paragraph: {
        rich_text: [
          { type: "text", text: { content: "The Illustrated Transformer - Jay Alammar (2025 更新版)" } },
          { type: "text", text: { content: "\n" } },
          { type: "text", text: { content: "http://jalammar.github.io/illustrated-transformer/", link: { url: "http://jalammar.github.io/illustrated-transformer/" } } },
          { type: "text", text: { content: "\n" } },
          { type: "text", text: { content: "2025 年新增动画课程" } }
        ]
      }
    },
    {
      object: "block",
      type: "paragraph",
      paragraph: {
        rich_text: [
          { type: "text", text: { content: "Architecture and Working of Transformers in Deep Learning - GeeksforGeeks (2025-10)" } },
          { type: "text", text: { content: "\n" } },
          { type: "text", text: { content: "https://www.geeksforgeeks.org/deep-learning/architecture-and-working-of-transformers-in-deep-learning/", link: { url: "https://www.geeksforgeeks.org/deep-learning/architecture-and-working-of-transformers-in-deep-learning/" } } }
        ]
      }
    },
    {
      object: "block",
      type: "paragraph",
      paragraph: {
        rich_text: [
          { type: "text", text: { content: "How Transformers Work: A Detailed Exploration - DataCamp (2024-01)" } },
          { type: "text", text: { content: "\n" } },
          { type: "text", text: { content: "https://www.datacamp.com/tutorial/how-transformers-work", link: { url: "https://www.datacamp.com/tutorial/how-transformers-work" } } }
        ]
      }
    },
    {
      object: "block",
      type: "paragraph",
      paragraph: {
        rich_text: [
          { type: "text", text: { content: "Dive into Deep Learning: The Transformer Architecture" } },
          { type: "text", text: { content: "\n" } },
          { type: "text", text: { content: "https://d2l.ai/chapter_attention-mechanisms-and-transformers/transformer.html", link: { url: "https://d2l.ai/chapter_attention-mechanisms-and-transformers/transformer.html" } } }
        ]
      }
    },
    {
      object: "block",
      type: "heading_3",
      heading_3: {
        rich_text: [{ type: "text", text: { content: "中文教程" } }]
      }
    },
    {
      object: "block",
      type: "paragraph",
      paragraph: {
        rich_text: [
          { type: "text", text: { content: "探秘Transformer系列之（1）：注意力机制 - 罗西的思考" } },
          { type: "text", text: { content: "\n" } },
          { type: "text", text: { content: "https://www.cnblogs.com/rossiXYZ/p/18705809", link: { url: "https://www.cnblogs.com/rossiXYZ/p/18705809" } } }
        ]
      }
    },
    {
      object: "block",
      type: "paragraph",
      paragraph: {
        rich_text: [
          { type: "text", text: { content: "从头开始构建 Transformer: 注意力机制 - 阿里云开发者社区 (2024-10)" } },
          { type: "text", text: { content: "\n" } },
          { type: "text", text: { content: "https://developer.aliyun.com/article/1500168", link: { url: "https://developer.aliyun.com/article/1500168" } } }
        ]
      }
    },
    {
      object: "block",
      type: "heading_3",
      heading_3: {
        rich_text: [{ type: "text", text: { content: "课程讲义" } }]
      }
    },
    {
      object: "block",
      type: "paragraph",
      paragraph: {
        rich_text: [
          { type: "text", text: { content: "Transformer and Newer Architectures - CMU Deep Learning (Spring 2025)" } },
          { type: "text", text: { content: "\n" } },
          { type: "text", text: { content: "https://deeplearning.cs.cmu.edu/S25/document/slides/lec19.transformer.pdf", link: { url: "https://deeplearning.cs.cmu.edu/S25/document/slides/lec19.transformer.pdf" } } },
          { type: "text", text: { content: "\n" } },
          { type: "text", text: { content: "内容包括：Transformer 架构、改进版本、多模态应用、参数高效微调" } }
        ]
      }
    },
    {
      object: "block",
      type: "heading_3",
      heading_3: {
        rich_text: [{ type: "text", text: { content: "代码实现" } }]
      }
    },
    {
      object: "block",
      type: "paragraph",
      paragraph: {
        rich_text: [
          { type: "text", text: { content: "Transformer from Scratch (PyTorch)" } },
          { type: "text", text: { content: "\n" } },
          { type: "text", text: { content: "https://github.com/hyunwoongko/transformer", link: { url: "https://github.com/hyunwoongko/transformer" } } },
          { type: "text", text: { content: "\n\n" } },
          { type: "text", text: { content: "annotated-transformer (带注释的 PyTorch 实现)" } },
          { type: "text", text: { content: "\n" } },
          { type: "text", text: { content: "https://github.com/harvardnlp/annotated-transformer", link: { url: "https://github.com/harvardnlp/annotated-transformer" } } }
        ]
      }
    },
    {
      object: "block",
      type: "heading_3",
      heading_3: {
        rich_text: [{ type: "text", text: { content: "最新进展与优化" } }]
      }
    },
    {
      object: "block",
      type: "paragraph",
      paragraph: {
        rich_text: [
          { type: "text", text: { content: "Performer - 谷歌大脑 (线性复杂度注意力)" } },
          { type: "text", text: { content: "\n" } },
          { type: "text", text: { content: "通过随机正交特性实现无偏估计，资源需求线性增长" } },
          { type: "text", text: { content: "\n" } },
          { type: "text", text: { content: "https://www.linkresearcher.com/theses/ebd1472f-a6b3-49c7-ae34-a25eedd0e08e/", link: { url: "https://www.linkresearcher.com/theses/ebd1472f-a6b3-49c7-ae34-a25eedd0e08e/" } } }
        ]
      }
    },
    {
      object: "block",
      type: "paragraph",
      paragraph: {
        rich_text: [
          { type: "text", text: { content: "AttentionViz - 哈佛大学 (注意力可视化工具)" } },
          { type: "text", text: { content: "\n" } },
          { type: "text", text: { content: "全局视角可视化 Transformer 注意力机制" } },
          { type: "text", text: { content: "\n" } },
          { type: "text", text: { content: "通过查询-键向量联合嵌入分析多序列间的全局模式" } },
          { type: "text", text: { content: "\n" } },
          { type: "text", text: { content: "https://hub.baai.ac.cn/view/26690", link: { url: "https://hub.baai.ac.cn/view/26690" } } }
        ]
      }
    }
  ]
});

const options = {
  hostname: 'api.notion.com',
  path: '/v1/pages',
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json',
    'Notion-Version': '2025-09-03',
    'Content-Length': Buffer.byteLength(data)
  }
};

const req = https.request(options, (res) => {
  let responseData = '';
  res.on('data', (chunk) => { responseData += chunk; });
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    try {
      const json = JSON.parse(responseData);
      console.log('Page created:', json.url || json);
    } catch (e) {
      console.log('Response:', responseData);
    }
  });
});

req.on('error', (e) => {
  console.error('Error:', e);
});

req.write(data);
req.end();
