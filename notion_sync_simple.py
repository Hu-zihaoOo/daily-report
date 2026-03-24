#!/usr/bin/env python3
import requests
import json

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
    print(f"Update title response: {response.status_code}")
    if response.status_code != 200:
        print(response.text)
    response.raise_for_status()
    return response.json()


def append_simple_blocks():
    """添加简单的测试 blocks"""
    url = f"{BASE_URL}/blocks/{PAGE_ID}/children"
    
    blocks = [
        {
            "object": "block",
            "type": "heading_1",
            "heading_1": {
                "rich_text": [{"type": "text", "text": {"content": "AI Infra（AI 基础设施）学习资料整理"}}]
            }
        },
        {
            "object": "block",
            "type": "paragraph",
            "paragraph": {
                "rich_text": [{"type": "text", "text": {"content": "本资料收集整理了 AI 基础设施相关的学习资源。"}}]
            }
        }
    ]
    
    data = {"children": blocks}
    print("Sending simple blocks:")
    print(json.dumps(data, indent=2))
    
    response = requests.patch(url, headers=headers, json=data)
    print(f"Response status: {response.status_code}")
    if response.status_code != 200:
        print("Error response:")
        print(response.text)
    response.raise_for_status()
    return response.json()


def main():
    print("测试 Notion API...")
    
    # 1. 更新页面标题
    title = "AI Infra（AI 基础设施）学习资料整理"
    update_page_title(title)
    print(f"✓ 更新页面标题为: {title}")
    
    # 2. 添加简单 blocks
    append_simple_blocks()
    print("✓ 添加简单 blocks 成功")
    
    print("\n✅ 测试完成！")


if __name__ == "__main__":
    main()
