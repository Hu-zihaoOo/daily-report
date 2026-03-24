
const https = require('https');

const API_KEY = 'ntn_w26963045396jBC2hQj2S0QsNVZQczwlYzioTyoTXZC8jb';
const PAGE_ID = '0a169d1ae4d045d39a85cecff9b4ba9e';

// Part 1: AI 基础设施架构
const children = [
  {
    object: "block",
    type: "heading_1",
    heading_1: {
      rich_text: [{ type: "text", text: { content: "AI Infra（AI 基础设施）学习资料整理" } }]
    }
  },
  {
    object: "block",
    type: "paragraph",
    paragraph: {
      rich_text: [{ type: "text", text: { content: "本资料收集整理了 AI 基础设施相关的学习资源，涵盖架构、工具、部署优化、MLOps 和大模型基础设施等方向。" } }]
    }
  },
  {
    object: "block",
    type: "heading_2",
    heading_2: {
      rich_text: [{ type: "text", text: { content: "目录" } }]
    }
  },
  {
    object: "block",
    type: "bulleted_list_item",
    bulleted_list_item: {
      rich_text: [{ type: "text", text: { content: "1. AI 基础设施架构" } }]
    }
  },
  {
    object: "block",
    type: "bulleted_list_item",
    bulleted_list_item: {
      rich_text: [{ type: "text", text: { content: "2. 主流框架和工具" } }]
    }
  },
  {
    object: "block",
    type: "bulleted_list_item",
    bulleted_list_item: {
      rich_text: [{ type: "text", text: { content: "3. 模型部署和推理优化" } }]
    }
  },
  {
    object: "block",
    type: "bulleted_list_item",
    bulleted_list_item: {
      rich_text: [{ type: "text", text: { content: "4. MLOps 和流水线" } }]
    }
  },
  {
    object: "block",
    type: "bulleted_list_item",
    bulleted_list_item: {
      rich_text: [{ type: "text", text: { content: "5. 大型语言模型基础设施" } }]
    }
  },
  {
    object: "block",
    type: "heading_2",
    heading_2: {
      rich_text: [{ type: "text", text: { content: "1. AI 基础设施架构" } }]
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
        { type: "text", text: { content: "AI Infrastructure Tutorial & Best Practices / AI 基础设施教程与最佳实践\n" } },
        { type: "text", text: { content: "https://nexla.com/ai-infrastructure/", link: { url: "https://nexla.com/ai-infrastructure/" } } },
        { type: "text", text: { content: "\n描述：全面介绍数据存储、处理、训练、推理硬件和模型部署的关键概念和最佳实践\n难度：入门\n\n" } }
      ]
    }
  },
  {
    object: "block",
    type: "paragraph",
    paragraph: {
      rich_text: [
        { type: "text", text: { content: "AI Data Pipeline Architecture: How AI Models are Built and Deployed / AI 数据管道架构：AI 模型如何构建和部署\n" } },
        { type: "text", text: { content: "https://www.vastdata.com/blog/ai-data-pipeline-architecture", link: { url: "https://www.vastdata.com/blog/ai-data-pipeline-architecture" } } },
        { type: "text", text: { content: "\n描述：讲解 AI 数据管道架构，包括训练负载分布、检查点窗口和模型仓库\n难度：入门\n\n" } }
      ]
    }
  },
  {
    object: "block",
    type: "paragraph",
    paragraph: {
      rich_text: [
        { type: "text", text: { content: "【AI系统】推理系统介绍\n" } },
        { type: "text", text: { content: "https://www.cnblogs.com/ZOMI/articles/18560797", link: { url: "https://www.cnblogs.com/ZOMI/articles/18560797" } } },
        { type: "text", text: { content: "\n描述：中文入门教程，介绍推理系统的基本概念和应用场景\n难度：入门\n\n" } }
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
        { type: "text", text: { content: "Building AI Infrastructure: A Practical Guide / 构建 AI 基础设施：实践指南\n" } },
        { type: "text", text: { content: "https://www.mirantis.com/blog/build-ai-infrastructure-your-definitive-guide-to-getting-ai-right/", link: { url: "https://www.mirantis.com/blog/build-ai-infrastructure-your-definitive-guide-to-getting-ai-right/" } } },
        { type: "text", text: { content: "\n描述：深入探讨 Kubernetes 自动扩展、CI/CD 流水线和监控\n难度：中级\n\n" } }
      ]
    }
  },
  {
    object: "block",
    type: "paragraph",
    paragraph: {
      rich_text: [
        { type: "text", text: { content: "【AI系统】推理系统架构\n" } },
        { type: "text", text: { content: "https://www.cnblogs.com/ZOMI/articles/18560833", link: { url: "https://www.cnblogs.com/ZOMI/articles/18560833" } } },
        { type: "text", text: { content: "\n描述：基于 NVIDIA Triton Inference Server 深入探讨推理系统架构\n难度：中级\n\n" } }
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
        { type: "text", text: { content: "AI Infrastructure | Google Cloud / AI 基础设施\n" } },
        { type: "text", text: { content: "https://cloud.google.com/ai-infrastructure", link: { url: "https://cloud.google.com/ai-infrastructure" } } },
        { type: "text", text: { content: "\n描述：谷歌云官方文档，介绍 GPU、TPU、CPU 选择和 Vertex AI 托管基础设施\n难度：高级\n\n" } }
      ]
    }
  },
  {
    object: "block",
    type: "paragraph",
    paragraph: {
      rich_text: [
        { type: "text", text: { content: "超大规模 AI 基础设施建设实践，极致释放算力效能\n" } },
        { type: "text", text: { content: "https://zhuanlan.zhihu.com/p/1948713405029516726", link: { url: "https://zhuanlan.zhihu.com/p/1948713405029516726" } } },
        { type: "text", text: { content: "\n描述：中文深度文章，介绍万卡集群推理场景优化和全栈运维体系\n难度：高级\n\n" } }
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
      console.log('Part 1 synced successfully!');
    } catch (e) {
      console.log('Response:', responseData);
    }
  });
});

req.on('error', (e) => console.error('Error:', e));
req.write(data);
req.end();
