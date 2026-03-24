
const https = require('https');

const API_KEY = 'ntn_w26963045396jBC2hQj2S0QsNVZQczwlYzioTyoTXZC8jb';
const PAGE_ID = '0a169d1ae4d045d39a85cecff9b4ba9e';

// Part 2: 主流框架和工具
const children = [
  {
    object: "block",
    type: "heading_2",
    heading_2: {
      rich_text: [{ type: "text", text: { content: "2. 主流框架和工具" } }]
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
        { type: "text", text: { content: "Kubeflow / Kubeflow 官方网站\n" } },
        { type: "text", text: { content: "https://www.kubeflow.org/", link: { url: "https://www.kubeflow.org/" } } },
        { type: "text", text: { content: "\n描述：Kubeflow 官方主页，介绍如何在 Kubernetes 上自动化部署 ML 工作流\n难度：入门\n\n" } }
      ]
    }
  },
  {
    object: "block",
    type: "paragraph",
    paragraph: {
      rich_text: [
        { type: "text", text: { content: "Introduction to AI/ML Toolkits with Kubeflow (LFS147) / Kubeflow AI/ML 工具包介绍\n" } },
        { type: "text", text: { content: "https://training.linuxfoundation.org/training/introduction-to-ai-ml-toolkits-with-kubeflow-lfs147/", link: { url: "https://training.linuxfoundation.org/training/introduction-to-ai-ml-toolkits-with-kubeflow-lfs147/" } } },
        { type: "text", text: { content: "\n描述：Linux Foundation 免费课程，适合初学者\n难度：入门\n\n" } }
      ]
    }
  },
  {
    object: "block",
    type: "paragraph",
    paragraph: {
      rich_text: [
        { type: "text", text: { content: "Ray for ML Infrastructure — Ray 2.54.0 / Ray 机器学习基础设施\n" } },
        { type: "text", text: { content: "https://docs.ray.io/en/latest/ray-air/getting-started.html", link: { url: "https://docs.ray.io/en/latest/ray-air/getting-started.html" } } },
        { type: "text", text: { content: "\n描述：Ray 官方文档入门指南\n难度：入门\n\n" } }
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
        { type: "text", text: { content: "Architecture | Kubeflow / Kubeflow 架构\n" } },
        { type: "text", text: { content: "https://www.kubeflow.org/docs/started/architecture/", link: { url: "https://www.kubeflow.org/docs/started/architecture/" } } },
        { type: "text", text: { content: "\n描述：深入了解 Kubeflow 架构和数据准备步骤\n难度：中级\n\n" } }
      ]
    }
  },
  {
    object: "block",
    type: "paragraph",
    paragraph: {
      rich_text: [
        { type: "text", text: { content: "Build a ML platform with Kubeflow and Ray on GKE / 在 GKE 上用 Kubeflow 和 Ray 构建 ML 平台\n" } },
        { type: "text", text: { content: "https://cloud.google.com/blog/products/ai-machine-learning/build-a-ml-platform-with-kubeflow-and-ray-on-gke", link: { url: "https://cloud.google.com/blog/products/ai-machine-learning/build-a-ml-platform-with-kubeflow-and-ray-on-gke" } } },
        { type: "text", text: { content: "\n描述：实战教程，演示如何部署 Kubeflow 和 Ray\n难度：中级\n\n" } }
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
        { type: "text", text: { content: "Kubeflow 1.9: New Tools for Model Management and Training Optimization / Kubeflow 1.9：模型管理和训练优化新工具\n" } },
        { type: "text", text: { content: "https://blog.kubeflow.org/kubeflow-1.9-release/", link: { url: "https://blog.kubeflow.org/kubeflow-1.9-release/" } } },
        { type: "text", text: { content: "\n描述：Kubeflow 1.9 发布说明，包含与 Ray、Seldon、BentoML、KServe 的集成更新\n难度：高级\n\n" } }
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
      console.log('Part 2 synced successfully!');
    } catch (e) {
      console.log('Response:', responseData);
    }
  });
});

req.on('error', (e) => console.error('Error:', e));
req.write(data);
req.end();
