# Pollinations AI Chat Model — Agent Guide

> This document helps AI Agents understand and use this node when building n8n workflows.

## Overview

| Property | Value |
|----------|-------|
| **Package** | `n8n-nodes-pollinations-ai-chat-model` |
| **Node Type** | AI Sub-node (Language Model) |
| **Connection Type** | Output: `NodeConnectionType.AiLanguageModel` |
| **Credential** | Pollinations API (optional — free tier available) |
| **n8n displayName** | `Pollinations AI Chat Model` |

## What This Node Does

Provides a Pollinations AI Chat Model connector for n8n's AI Agent and LangChain workflow nodes. Pollinations offers free AI model access including various open-source models, making it ideal for development and testing.

## Credentials Setup

1. Pollinations API can be used without an API key for basic usage
2. For enhanced access, get an API key from [Pollinations](https://pollinations.ai/)
3. In n8n: Settings → Credentials → Add credential → Select **"Pollinations API"**

## Connection Types

| Direction | Type | Description |
|-----------|------|-------------|
| Input | None | Sub-node — no direct input connection |
| Output | `AiLanguageModel` | Connects to AI Agent, LLM Chain, or any node with Language Model input port |

## How to Use in Workflows

### Pattern 1: Free AI Agent
Connect to an **AI Agent** node for tool-calling workflows without API costs.

### Pattern 2: Development & Testing
Use as a drop-in replacement for paid models during workflow development.

## Gotchas & Known Issues

- **Free Tier Limits**: Rate limiting may apply for heavy usage
- **Bundled Build**: Uses `esbuild` to bundle dependencies
- **Sub-node Display**: Uses `logWrapper` + prototype patching for proper UI rendering
