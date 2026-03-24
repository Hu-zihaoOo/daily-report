
const https = require('https');

const API_KEY = 'ntn_w26963045396jBC2hQj2S0QsNVZQczwlYzioTyoTXZC8jb';
const PAGE_ID = '0a169d1ae4d045d39a85cecff9b4ba9e';

// Part 3: 模型部署和推理优化
const children = [
  {
    object: "block",
    type: "heading_2",
    heading_2: {
      rich_text: [{ type: "text", text: { content: "3. 模型部署和推理优化" } }]
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
        { type: "text", text: { content: "Quick Start Guide — NVIDIA TensorRT / NVIDIA TensorRT 快速入门指南\n" } },
        { type: "text", text: { content: "https://docs.nvidia.com/deeplearning/tensorrt/latest/getting-started/quick-start-guide.html", link: { url: "https://docs.nvidia.com/deeplearning/tensorrt/latest/getting-started/quick-start-guide.html" } } },
        { type: "text", text: { content: "\n描述：TensorRT 官方快速入门指南\n难度：入门\n\n" } }
      ]
    }
  },
  {
    object: "block",
    type: "paragraph",
    paragraph: {
      rich_text: [
        { type: "text", text: { content: "【AI系统】推理引擎架构\n" } },
        { type: "text", text: { content: "https://zhuanlan.zhihu.com/p/6873362107", link: { url: "https://zhuanlan.zhihu.com/p/6873362107" } } },
        { type: "text", text: { content: "\n描述：中文文章，介绍推理引擎的优化阶段、模型转换和压缩技术\n难度：入门\n\n" } }
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
        { type: "text", text: { content: "LLM Inference ( vLLM , TGI, TensorRT ) / LLM 推理（vLLM、TGI、TensorRT）\n" } },
        { type: "text", text: { content: "https://medium.com/@pratik.vyas_10544/llm-inference-vllm-tgi-tensorrt-17872f7df1f5", link: { url: "https://medium.com/@pratik.vyas_10544/llm-inference-vllm-tgi-tensorrt-17872f7df1f5" } } },
        { type: "text", text: { content: "\n描述：对比介绍 vLLM、TGI 和 TensorRT 三种推理框架\n难度：中级\n\n" } }
      ]
    }
  },
  {
    object: "block",
    type: "paragraph",
    paragraph: {
      rich_text: [
        { type: "text", text: { content: "Comparing GenAI Inference Engines: TensorRT-LLM, vLLM, Hugging Face TGI, and LMDeploy / 对比 GenAI 推理引擎\n" } },
        { type: "text", text: { content: "https://news.ycombinator.com/item?id=43620472", link: { url: "https://news.ycombinator.com/item?id=43620472" } } },
        { type: "text", text: { content: "\n描述：深度对比 TensorRT-LLM、vLLM、TGI 和 LMDeploy 的性能\n难度：中级\n\n" } }
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
        { type: "text", text: { content: "GitHub - NVIDIA/TensorRT-LLM / NVIDIA TensorRT-LLM 官方仓库\n" } },
        { type: "text", text: { content: "https://github.com/NVIDIA/TensorRT-LLM", link: { url: "https://github.com/NVIDIA/TensorRT-LLM" } } },
        { type: "text", text: { content: "\n描述：TensorRT LLM 官方仓库，提供 Python API 和优化推理运行时\n难度：高级\n\n" } }
      ]
    }
  },
  {
    object: "block",
    type: "paragraph",
    paragraph: {
      rich_text: [
        { type: "text", text: { content: "GitHub - NVIDIA/Model-Optimizer / NVIDIA 模型优化器\n" } },
        { type: "text", text: { content: "https://github.com/NVIDIA/Model-Optimizer", link: { url: "https://github.com/NVIDIA/Model-Optimizer" } } },
        { type: "text", text: { content: "\n描述：统一的 SOTA 模型优化库，支持量化、剪枝、蒸馏、推测解码等\n难度：高级\n\n" } }
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
      console.log('Part 3 synced successfully!');
    } catch (e) {
      console.log('Response:', responseData);
    }
  });
});

req.on('error', (e) => console.error('Error:', e));
req.write(data);
req.end();
