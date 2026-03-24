#!/usr/bin/env python3
import requests
import re
from typing import List, Dict, Any

# Notion configuration
NOTION_API_KEY = "ntn_w26963045396jBC2hQj2S0QsNVZQczwlYzioTyoTXZC8jb"
PAGE_ID = "3220a0b6579b8038a5bbc31e9f310276"
NOTION_API_BASE = "https://api.notion.com/v1"

# Headers for Notion API
headers = {
    "Authorization": f"Bearer {NOTION_API_KEY}",
    "Content-Type": "application/json",
    "Notion-Version": "2022-06-28"
}


def parse_markdown_to_blocks(markdown_text: str) -> List[Dict[str, Any]]:
    """Convert Markdown text to Notion blocks format"""
    blocks = []
    lines = markdown_text.split("\n")
    
    i = 0
    while i < len(lines):
        line = lines[i].rstrip()
        
        # Skip empty lines at the start
        if not line:
            i += 1
            continue
            
        # Headers
        if line.startswith("### "):
            blocks.append({
                "object": "block",
                "type": "heading_3",
                "heading_3": {
                    "rich_text": parse_rich_text(line[4:])
                }
            })
        elif line.startswith("## "):
            blocks.append({
                "object": "block",
                "type": "heading_2",
                "heading_2": {
                    "rich_text": parse_rich_text(line[3:])
                }
            })
        elif line.startswith("# "):
            blocks.append({
                "object": "block",
                "type": "heading_1",
                "heading_1": {
                    "rich_text": parse_rich_text(line[2:])
                }
            })
        # Horizontal rule
        elif line.strip() == "---":
            blocks.append({
                "object": "block",
                "type": "divider",
                "divider": {}
            })
        # Lists
        elif line.startswith("- "):
            list_items = []
            while i < len(lines) and lines[i].startswith("- "):
                list_items.append(lines[i][2:])
                i += 1
            # Add each list item as a separate block
            for item in list_items:
                blocks.append({
                    "object": "block",
                    "type": "bulleted_list_item",
                    "bulleted_list_item": {
                        "rich_text": parse_rich_text(item)
                    }
                })
            continue  # Skip incrementing i since we did it in the loop
        # Normal paragraph
        else:
            # Collect all consecutive non-empty lines for this paragraph
            paragraph_lines = [line]
            i += 1
            while i < len(lines) and lines[i].strip() and not lines[i].startswith(("#", "##", "###", "- ", "---")):
                paragraph_lines.append(lines[i].rstrip())
                i += 1
            
            if paragraph_lines:
                blocks.append({
                    "object": "block",
                    "type": "paragraph",
                    "paragraph": {
                        "rich_text": parse_rich_text("\n".join(paragraph_lines))
                    }
                })
            continue  # Skip incrementing i since we did it in the loop
        
        i += 1
    
    return blocks


def parse_rich_text(text: str) -> List[Dict[str, Any]]:
    """Parse text with markdown links into Notion rich text format"""
    rich_text = []
    
    # Pattern to match markdown links: [text](url)
    link_pattern = r'\[([^\]]+)\]\(([^)]+)\)'
    
    last_end = 0
    for match in re.finditer(link_pattern, text):
        # Text before the link
        if match.start() > last_end:
            rich_text.append({
                "type": "text",
                "text": {
                    "content": text[last_end:match.start()]
                }
            })
        
        # The link
        link_text = match.group(1)
        url = match.group(2).strip()
        
        # Check if it's a valid HTTP/HTTPS URL
        if url.startswith(("http://", "https://")):
            rich_text.append({
                "type": "text",
                "text": {
                    "content": link_text,
                    "link": {
                        "url": url
                    }
                }
            })
        else:
            # For internal anchors and other non-HTTP links, just show as plain text
            rich_text.append({
                "type": "text",
                "text": {
                    "content": link_text
                }
            })
        
        last_end = match.end()
    
    # Text after the last link
    if last_end < len(text):
        rich_text.append({
            "type": "text",
            "text": {
                "content": text[last_end:]
            }
        })
    
    # If no rich text elements, add the whole text as plain text
    if not rich_text:
        rich_text = [{
            "type": "text",
            "text": {
                "content": text
            }
        }]
    
    return rich_text


def update_page_title(page_id: str, title: str) -> bool:
    """Update the page title"""
    url = f"{NOTION_API_BASE}/pages/{page_id}"
    data = {
        "properties": {
            "title": {
                "title": [
                    {
                        "type": "text",
                        "text": {
                            "content": title
                        }
                    }
                ]
            }
        }
    }
    
    try:
        response = requests.patch(url, headers=headers, json=data)
        response.raise_for_status()
        return True
    except requests.exceptions.RequestException as e:
        print(f"Error updating page title: {e}")
        print(f"Response: {response.text if 'response' in locals() else 'No response'}")
        return False


def clear_page_children(page_id: str) -> bool:
    """Clear all existing blocks from the page"""
    url = f"{NOTION_API_BASE}/blocks/{page_id}/children?page_size=100"
    
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        data = response.json()
        
        blocks_to_delete = []
        for block in data.get("results", []):
            blocks_to_delete.append(block["id"])
        
        # Delete each block
        for block_id in blocks_to_delete:
            delete_url = f"{NOTION_API_BASE}/blocks/{block_id}"
            delete_response = requests.delete(delete_url, headers=headers)
            delete_response.raise_for_status()
        
        return True
    except requests.exceptions.RequestException as e:
        print(f"Error clearing page children: {e}")
        print(f"Response: {response.text if 'response' in locals() else 'No response'}")
        return False


def append_blocks_to_page(page_id: str, blocks: List[Dict[str, Any]]) -> bool:
    """Append blocks to the page (Notion allows max 100 blocks per request)"""
    url = f"{NOTION_API_BASE}/blocks/{page_id}/children"
    
    # Split blocks into chunks of 100
    chunk_size = 100
    for i in range(0, len(blocks), chunk_size):
        chunk = blocks[i:i + chunk_size]
        data = {"children": chunk}
        
        try:
            response = requests.patch(url, headers=headers, json=data)
            response.raise_for_status()
        except requests.exceptions.RequestException as e:
            print(f"Error appending blocks (chunk {i//chunk_size + 1}): {e}")
            print(f"Response: {response.text if 'response' in locals() else 'No response'}")
            return False
    
    return True


def main():
    # Read the markdown file
    with open("/root/.openclaw/workspace/weekly-report-2026-03-13.md", "r", encoding="utf-8") as f:
        markdown_content = f.read()
    
    # Parse markdown to Notion blocks
    print("Parsing Markdown to Notion blocks...")
    blocks = parse_markdown_to_blocks(markdown_content)
    print(f"Generated {len(blocks)} blocks")
    
    # Update page title
    page_title = "2026年3月13日 - 图形/游戏/AI 行业周报"
    print(f"Updating page title to: {page_title}")
    if not update_page_title(PAGE_ID, page_title):
        return
    
    # Clear existing content
    print("Clearing existing page content...")
    if not clear_page_children(PAGE_ID):
        return
    
    # Append new blocks
    print("Appending new blocks to page...")
    if append_blocks_to_page(PAGE_ID, blocks):
        print("Successfully synced weekly report to Notion!")
    else:
        print("Failed to sync weekly report to Notion.")


if __name__ == "__main__":
    main()
