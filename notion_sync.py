#!/usr/bin/env python3
import requests
import json
import re

# Notion API 配置
NOTION_API_KEY = "ntn_w26963045396jBC2hQj2S0QsNVZQczwlYzioTyoTXZC8jb"
PAGE_ID = "0a169d1ae4d045d39a85cecff9b4ba9e"
BASE_URL = "https://api.notion.com/v1"

# 请求头
headers = {
    "Authorization": f"Bearer {NOTION_API_KEY}",
    "Content-Type": "application/json",
    "Notion-Version": "2022-06-28"
}


def parse_markdown_to_blocks(markdown_text):
    """将 Markdown 文本转换为 Notion blocks 格式"""
    blocks = []
    lines = markdown_text.split('\n')
    
    i = 0
    while i < len(lines):
        line = lines[i].strip()
        
        # 空行
        if not line:
            i += 1
            continue
            
        # 标题
        if line.startswith('#'):
            heading_level = len(line.split()[0])
            heading_text = line.lstrip('#').strip()
            blocks.append({
                "object": "block",
                "type": f"heading_{min(heading_level, 3)}",
                f"heading_{min(heading_level, 3)}": {
                    "rich_text": [{"type": "text", "text": {"content": heading_text}}]
                }
            })
            i += 1
            
        # 引用块
        elif line.startswith('>'):
            quote_text = line.lstrip('>').strip()
            blocks.append({
                "object": "block",
                "type": "quote",
                "quote": {
                    "rich_text": [{"type": "text", "text": {"content": quote_text}}]
                }
            })
            i += 1
            
        # 分割线
        elif line.startswith('---'):
            blocks.append({
                "object": "block",
                "type": "divider",
                "divider": {}
            })
            i += 1
            
        # 表格检测
        elif line.startswith('|'):
            # 收集所有表格行
            table_lines = []
            while i < len(lines) and lines[i].strip().startswith('|'):
                table_lines.append(lines[i].strip())
                i += 1
            
            # 解析表格数据
            table_data = []
            for table_line in table_lines:
                # 移除首尾的 | 并分割
                cells = [cell.strip() for cell in table_line.strip('|').split('|')]
                table_data.append(cells)
            
            # 跳过分隔线（第二行通常是 ---|---|---）
            if len(table_data) >= 2 and all(cell.startswith('-') for cell in table_data[1]):
                header_row = table_data[0]
                data_rows = table_data[2:] if len(table_data) > 2 else []
            else:
                header_row = table_data[0] if table_data else []
                data_rows = table_data[1:] if len(table_data) > 1 else []
            
            # 创建 Notion 表格块
            if header_row:
                # 先创建表格
                blocks.append({
                    "object": "block",
                    "type": "table",
                    "table": {
                        "table_width": len(header_row),
                        "has_column_header": True,
                        "has_row_header": False,
                        "children": []
                    }
                })
                
                # 添加表头行
                table_block = blocks[-1]
                table_block["table"]["children"].append({
                    "type": "table_row",
                    "table_row": {
                        "cells": [
                            [{"type": "text", "text": {"content": cell}}]
                            for cell in header_row
                        ]
                    }
                })
                
                # 添加数据行
                for data_row in data_rows:
                    # 确保数据行的列数与表头一致
                    padded_row = data_row + [''] * (len(header_row) - len(data_row))
                    cells = []
                    for cell in padded_row[:len(header_row)]:
                        # 处理单元格中的链接
                        cell_rich_text = parse_text_with_links(cell)
                        cells.append(cell_rich_text)
                    
                    table_block["table"]["children"].append({
                        "type": "table_row",
                        "table_row": {"cells": cells}
                    })
            
        # 列表
        elif line.startswith('- ') or re.match(r'^\d+\.\s', line):
            # 简单处理为段落
            blocks.append({
                "object": "block",
                "type": "paragraph",
                "paragraph": {
                    "rich_text": parse_text_with_links(line)
                }
            })
            i += 1
            
        # 普通段落
        else:
            blocks.append({
                "object": "block",
                "type": "paragraph",
                "paragraph": {
                    "rich_text": parse_text_with_links(line)
                }
            })
            i += 1
    
    return blocks


def parse_text_with_links(text):
    """解析包含链接的文本，转换为 Notion rich_text 格式"""
    # 匹配 [text](url) 格式的链接
    pattern = r'\[(.*?)\]\((.*?)\)'
    parts = []
    last_end = 0
    
    for match in re.finditer(pattern, text):
        # 链接前的文本
        if match.start() > last_end:
            parts.append({
                "type": "text",
                "text": {"content": text[last_end:match.start()]}
            })
        
        # 链接文本
        link_text = match.group(1)
        link_url = match.group(2)
        parts.append({
            "type": "text",
            "text": {
                "content": link_text,
                "link": {"url": link_url}
            }
        })
        
        last_end = match.end()
    
    # 链接后的文本
    if last_end < len(text):
        parts.append({
            "type": "text",
            "text": {"content": text[last_end:]}
        })
    
    return parts if parts else [{"type": "text", "text": {"content": text}}]


def update_page_title(title):
    """更新页面标题"""
    url = f"{BASE_URL}/pages/{PAGE_ID}"
    data = {
        "properties": {
            "title": {
                "title": [{"type": "text", "text": {"content": title}}]
            }
        }
    }
    
    response = requests.patch(url, headers=headers, json=data)
    response.raise_for_status()
    return response.json()


def clear_page_content():
    """清空页面内容（Notion API 不支持直接删除，需要归档或替换）"""
    # 这里我们只是简单地更新页面，添加新内容会替换旧内容
    pass


def append_blocks_to_page(blocks):
    """向页面添加 blocks"""
    url = f"{BASE_URL}/blocks/{PAGE_ID}/children"
    
    # Notion API 限制每次最多添加 100 个 blocks
    chunk_size = 100
    for i in range(0, len(blocks), chunk_size):
        chunk = blocks[i:i + chunk_size]
        data = {"children": chunk}
        print(f"Sending chunk {i//chunk_size + 1}:")
        print(json.dumps(data, indent=2, ensure_ascii=False)[:500])
        response = requests.patch(url, headers=headers, json=data)
        if response.status_code != 200:
            print(f"Error response: {response.status_code}")
            print(response.text)
        response.raise_for_status()
        print(f"Added {len(chunk)} blocks (chunk {i//chunk_size + 1})")
    
    return True


def main():
    print("开始同步 AI Infra 学习资料到 Notion...")
    
    # 1. 读取 Markdown 文件
    with open("/root/.openclaw/workspace/ai-infra-resources.md", "r", encoding="utf-8") as f:
        markdown_content = f.read()
    
    print("✓ 读取 Markdown 文件成功")
    
    # 2. 更新页面标题
    title = "AI Infra（AI 基础设施）学习资料整理"
    update_page_title(title)
    print(f"✓ 更新页面标题为: {title}")
    
    # 3. 解析 Markdown 为 Notion blocks
    blocks = parse_markdown_to_blocks(markdown_content)
    print(f"✓ 解析 Markdown 为 {len(blocks)} 个 Notion blocks")
    
    # 4. 添加 blocks 到页面
    # 注意：Notion API 没有清空页面的简单方法，这里直接追加
    # 如果需要完全替换，需要先获取现有 blocks 并删除（更复杂）
    append_blocks_to_page(blocks)
    print("✓ 成功添加所有 blocks 到页面")
    
    print("\n✅ 同步完成！")


if __name__ == "__main__":
    main()
