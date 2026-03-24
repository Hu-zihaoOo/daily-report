
import { Client } from "@notionhq/client";

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

async function test() {
  try {
    const page = await notion.pages.retrieve({ page_id: "0a169d1ae4d045d39a85cecff9b4ba9e" });
    console.log("Page info:", JSON.stringify(page, null, 2));
  } catch (error) {
    console.error("Error:", error.message);
    if (error.code) console.error("Code:", error.code);
  }
}

test();
