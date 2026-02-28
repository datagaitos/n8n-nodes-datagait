# n8n-nodes-datagait

n8n community node for **[DataGait](https://datagait.com)** — scrape, extract, and crawl data from JavaScript-heavy websites with the world's fastest headless DOM engine.

[npm](https://www.npmjs.com/package/n8n-nodes-datagait) | [Documentation](https://datagait.com/help) | [Report Issue](https://github.com/datagaitos/n8n-nodes-datagait/issues)

## Features

- **Full JavaScript Rendering** — Renders SPAs, React, Angular, Vue, and dynamic content before extraction
- **Structured Data Extraction** — JSON-LD, Open Graph, Twitter Cards, microdata in a single call
- **Multi-Page Crawling** — Crawl entire sites with intelligent link following and SSE streaming
- **Proxy Support** — Smart proxy routing with `X-Proxy-Mode` (off / smart / always)
- **Blazing Fast** — Powered by a Rust-based headless DOM engine, 10x faster than traditional headless browsers
- **Clean Text Output** — CSS-aware text extraction ideal for LLM and AI data pipelines
- **Real-Time Credit Tracking** — Per-page credit usage and remaining balance in crawl events

## Installation

### From n8n Community Nodes (recommended)

1. Open your n8n instance
2. Go to **Settings** → **Community Nodes**
3. Click **Install a community node**
4. Search for `n8n-nodes-datagait`
5. Click **Install**

### Manual Installation

```bash
cd ~/.n8n
npm install n8n-nodes-datagait
# Restart n8n
```

## Setup

1. Sign up at [datagait.com](https://datagait.com)
2. Go to **Dashboard** → **Settings** → **API Keys** → **Create API Key**
3. In n8n, add **DataGait API** credentials with your `dg_live_xxx` token
4. Click **Test** to verify the connection

## Actions (6)

### Scraping Actions (`GET /extract`)

| Action | Description |
|--------|-------------|
| **Extract Page** | Extract content from a webpage with full JavaScript rendering. Choose which fields to return: HTML, text, links, media, meta tags, and structured data. |
| **Scrape Text** | Extract clean, readable text content from a URL. Ideal for feeding into LLMs, AI agents, and NLP pipelines. |
| **Scrape Links** | Extract all links from a webpage with resolved absolute URLs and link count. |
| **Scrape Metadata** | Extract meta tags, Open Graph, Twitter Cards, and JSON-LD structured data from any page. |

### Crawling Actions (`POST /crawl` — SSE streaming)

| Action | Description |
|--------|-------------|
| **Crawl Site** | Crawl multiple pages from a site with intelligent extraction. Configure output fields (text, html, links, media, meta, structured_data), max pages (up to 100), and parallel workers. Results streamed via Server-Sent Events with real-time credit tracking. |

### Account Actions

| Action | Description |
|--------|-------------|
| **Health Check** | Check DataGait API availability and measure response latency. |

## Output Fields

### Extract Page

| Field | Description |
|-------|-------------|
| `url` | The final URL after redirects |
| `title` | Page title |
| `html` | Full rendered HTML after JavaScript execution |
| `text` | CSS-aware innerText — clean, readable content |
| `links` | All `<a>` and `<link>` elements with resolved absolute URLs |
| `media` | Images, videos, and audio elements with src and alt |
| `meta` | All `<meta>` tags (name, property, content) |
| `structured_data` | JSON-LD, microdata, Open Graph, Twitter Cards |
| `timing_ms` | Extraction time in milliseconds |
| `proxy_used` | Whether a proxy was used for the request |
| `proxy_provider` | Proxy provider: `datagait`, `byop`, or `none` |

### Crawl Site

| Field | Description |
|-------|-------------|
| `url` | Starting URL |
| `pages` | Array of page events (each with `url`, `page_num`, `text`, `title`, `links`, `credits_used`, `credits_remaining`) |
| `page_count` | Number of pages crawled |
| `total_ms` | Total crawl time in milliseconds |
| `total_credits_used` | Total credits consumed |
| `credit_exhausted` | `true` if crawl stopped due to credit exhaustion |

### Crawl SSE Events

| Event Type | Description |
|------------|-------------|
| `started` | First event — confirms crawl started with `max_pages` and `credits_available` |
| `page` | One per page — includes `success`, content fields, `credits_used`, `credits_remaining` |
| `done` | Final event — `total_pages`, `total_content`, `total_links`, `total_ms`, `total_credits_used` |
| `credit_exhausted` | Only if credits run out mid-crawl — `pages_completed`, `credits_used` |

## API Details

- **Extract**: `GET /extract?url=<url>&html=true&text=true&...`
- **Crawl**: `POST /crawl` with JSON body `{ url, config: { max_pages, text, html, links, workers, ... } }`
- **Auth**: `X-API-Key: dg_live_xxx` header
- **Base URL**: `https://ingest.datagait.com` (configurable for self-hosted)
- **Proxy**: Optional `X-Proxy-Mode` header (`off` / `smart` / `always`)
- **Crawl Timeout**: Up to 300s — SSE stream stays open until `done` or `credit_exhausted`

## Why DataGait?

| Feature | DataGait | Firecrawl | Apify |
|---------|----------|-----------|-------|
| JS Rendering | Rust-based headless DOM (fastest) | Chrome-based | Chrome-based |
| Latency | Sub-second for most pages | 2-10s typical | 5-30s typical |
| Structured Data | JSON-LD, OG, Twitter, microdata | Limited | Varies by actor |
| Crawl Streaming | Real-time SSE with per-page credits | Webhook/polling | Polling |
| Proxy Support | Built-in smart proxy routing | Separate config | Separate config |
| Pricing | 1 credit/page (10 via proxy) | Pay per extraction | Pay per compute |

## Development

### Build

```bash
cd integrations/n8n
npm install
npm run build
```

### Test Locally with n8n

```bash
cd integrations/n8n
npm link

cd ~/.n8n/custom
npm link n8n-nodes-datagait

# Restart n8n — the DataGait node will appear in the editor
```

### Publish to npm

```bash
# 1. Bump version in package.json
# 2. Build and publish
npm publish
```

Once published to npm with the `n8n-community-node-package` keyword, it will automatically appear in the n8n Community Nodes marketplace.

## Example Workflows

See the `examples/` directory for importable n8n workflow JSON files:

- **price-monitoring.json** — Monitor product prices on a schedule, alert on drops
- **job-board-scraper.json** — Scrape job listings and save to Airtable

## Resources

- [DataGait Website](https://datagait.com)
- [API Documentation](https://datagait.com/help)
- [Report an Issue](https://github.com/datagaitos/n8n-nodes-datagait/issues)
- [npm Package](https://www.npmjs.com/package/n8n-nodes-datagait)

## License

MIT
