
const https = require('https');

const API_KEY = process.env.NOTION_API_KEY;
const PAGE_ID = '0a169d1a-e4d0-45d3-9a85-cecff9b4ba9e';

const options = {
  hostname: 'api.notion.com',
  path: `/v1/blocks/${PAGE_ID}/children?page_size=100`,
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${API_KEY}`,
    'Notion-Version': '2025-09-03',
  }
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    try {
      const json = JSON.parse(data);
      console.log('Blocks:', JSON.stringify(json, null, 2));
    } catch (e) {
      console.log('Raw:', data);
    }
  });
});

req.on('error', (e) => {
  console.error('Error:', e);
});

req.end();
