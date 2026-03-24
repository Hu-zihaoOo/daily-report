
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
            content: "Transformer 架构原理与实现"
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
          { type: "text", text: { content: "The Illustrated Transformer - Jay Alammar" } },
          { type: "text", text: { content: "\n" } },
          { type: "text", text: { content: "http://jalammar.github.io/illustrated-transformer/", link: { url: "http://jalammar.github.io/illustrated-transformer/" } } }
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
