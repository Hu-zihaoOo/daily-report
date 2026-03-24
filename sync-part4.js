
const https = require('https');

const API_KEY = 'ntn_w26963045396jBC2hQj2S0QsNVZQczwlYzioTyoTXZC8jb';
const PAGE_ID = '0a169d1ae4d045d39a85cecff9b4ba9e';

// Part 4: MLOps 和流水线
const children = [
  {
    object: "block",
    type: "heading_2",
    heading_2: {
      rich_text: [{ type: "text", text: { content: "4. MLOps 和流水线" } }]
    }
  },
  {
    object: "block",
    type: "heading_3",
    heading_3: {
      rich_text: [{ type: "text", text: { content: "入门级" } }]
    }
  },
  {
    object: "block",
    type: "paragraph",
    paragraph: {
      rich_text: [
        { type: "text", text: { content: "Machine Learning Operations / 机器学习运维\n" } },
        { type: "text", text: { content: "https://ml-ops.org/content/mlops-principles", link: { url: "https://ml-ops.org/content/mlops-principles" } } },
        { type: "text", text: { content: "\n描述：MLOps 基础原理介绍，三个自动化级别\n难度：入门\n\n" } }
      ]
    }
  },
  {
    object: "block",
    type: "paragraph",
    paragraph: {
      rich_text: [
        { type: "text", text: { content: "What is MLOps? | Databricks / 什么是 MLOps？\n" } },
        { type: "text", text: { content: "https://databricks.com/glossary/mlops", link: { url: "https://databricks.com/glossary/mlops" } } },
        { type: "text", text: { content: "\n描述：Databricks 的 MLOps 术语表解释\n难度：入门\n\n" } }
      ]
    }
  },
  {
    object: "block",
    type: "paragraph",
    paragraph: {
      rich_text: [
        { type: "text", text: { content: "什么是机器学习运维(MLOps)？\n" } },
        { type: "text", text: { content: "https://www.ibm.com/cn-zh/think/topics/mlops", link: { url: "https://www.ibm.com/cn-zh/think/topics/mlops" } } },
        { type: "text", text: { content: "\n描述：IBM 中文 MLOps 介绍\n难度：入门\n\n" } }
      ]
    }
  },
  {
    object: "block",
    type: "heading_3",
    heading_3: {
      rich_text: [{ type: "text", text: { content: "中级" } }]
    }
  },
  {
    object: "block",
    type: "paragraph",
    paragraph: {
      rich_text: [
        { type: "text", text: { content: "MLOps: Continuous delivery and automation pipelines in machine learning / MLOps：机器学习中的持续交付和自动化流水线\n" } },
        { type: "text", text: { content: "https://cloud.google.com/architecture/mlops-continuous-delivery-and-automation-pipelines-in-machine-learning", link: { url: "https://cloud.google.com/architecture/mlops-continuous-delivery-and-automation-pipelines-in-machine-learning" } } },
        { type: "text", text: { content: "\n描述：Google Cloud 架构中心的 MLOps 详细指南\n难度：中级\n\n" } }
      ]
    }
  },
  {
    object: "block",
    type: "paragraph",
    paragraph: {
      rich_text: [
        { type: "text", text: { content: "MLOps Fundamentals | DataCamp / MLOps 基础\n" } },
        { type: "text", text: { content: "https://www.datacamp.com/tracks/mlops-fundamentals", link: { url: "https://www.datacamp.com/tracks/mlops-fundamentals" } } },
        { type: "text", text: { content: "\n描述：DataCamp 的 MLOps 基础课程，涵盖 CI/CD、实验跟踪、特征存储等\n难度：中级\n\n" } }
      ]
    }
  },
  {
    object: "block",
    type: "heading_3",
    heading_3: {
      rich_text: [{ type: "text", text: { content: "高级" } }]
    }
  },
  {
    object: "block",
    type: "paragraph",
    paragraph: {
      rich_text: [
        { type: "text", text: { content: "MLOps Toys | A Curated List of Machine Learning Projects / MLOps 工具精选\n" } },
        { type: "text", text: { content: "https://tools.mlops.community/", link: { url: "https://tools.mlops.community/" } } },
        { type: "text", text: { content: "\n描述：MLOps 社区工具精选列表\n难度：高级\n\n" } }
      ]
    }
  },
  {
    object: "block",
    type: "paragraph",
    paragraph: {
      rich_text: [
        { type: "text", text: { content: "GitHub - liguodongiot/ai-system: LLM/MLOps/LLMOps\n" } },
        { type: "text", text: { content: "https://github.com/liguodongiot/ai-system", link: { url: "https://github.com/liguodongiot/ai-system" } } },
        { type: "text", text: { content: "\n描述：中文开源项目，包含特征存储、MLflow、模型推理等\n难度：高级\n\n" } }
      ]
    }
  }
];

const data = JSON.stringify({ children });

const options = {
  hostname: 'api.notion.com',
  path: `/v1/blocks/${PAGE_ID}/children`,
  method: 'PATCH',
  headers: {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json',
    'Notion-Version': '2025-09-03',
    'Content-Length': Buffer.byteLength(data)
  }
};

const req = https.request(options, (res) => {
  let responseData = '';
  res.on('data', (chunk) => responseData += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    try {
      const json = JSON.parse(responseData);
      console.log('Part 4 synced successfully!');
    } catch (e) {
      console.log('Response:', responseData);
    }
  });
});

req.on('error', (e) => console.error('Error:', e));
req.write(data);
req.end();
