import type { JsonObject } from 'n8n-workflow';
import {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeApiError,
	NodeConnectionTypes,
	NodeOperationError,
} from 'n8n-workflow';

export class DataGait implements INodeType {
	usableAsTool = true;

	description: INodeTypeDescription = {
		displayName: 'DataGait',
		name: 'dataGait',
		icon: 'file:datagait.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Scrape, crawl, and extract structured data from JavaScript-heavy websites using DataGait API',
		defaults: {
			name: 'DataGait',
		},
		documentationUrl: 'https://www.npmjs.com/package/n8n-nodes-datagait',
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'dataGaitApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
			options: [
				{
					name: 'Crawl Site',
					value: 'crawl',
					description: 'Crawl multiple pages from a site with intelligent extraction via SSE streaming',
					action: 'Crawl multiple pages from a site',
				},
				{
					name: 'Extract Page',
					value: 'extract',
					description: 'Extract content from a webpage with full JavaScript rendering',
					action: 'Extract content from a webpage',
				},
				{
					name: 'Health Check',
					value: 'health',
					description: 'Check DataGait API availability and response time',
					action: 'Check API health status',
				},
				{
					name: 'Scrape Links',
					value: 'scrapeLinks',
					description: 'Extract all links from a webpage with resolved absolute URLs',
					action: 'Scrape all links from a URL',
				},
				{
					name: 'Scrape Metadata',
					value: 'scrapeMeta',
					description: 'Extract meta tags, Open Graph, Twitter Cards, and JSON-LD structured data',
					action: 'Scrape metadata from a URL',
				},
				{
					name: 'Scrape Text',
					value: 'scrapeText',
					description: 'Extract clean text content from a URL, ideal for LLM and AI pipelines',
					action: 'Scrape text content from a URL',
				},
			],
				default: 'extract',
			},

			{
				displayName: 'URL',
				name: 'url',
				type: 'string',
				default: '',
				required: true,
				placeholder: 'e.g. https://example.com',
				description: 'The URL to extract content from',
				displayOptions: {
					show: {
						operation: ['extract', 'crawl', 'scrapeText', 'scrapeLinks', 'scrapeMeta'],
					},
				},
			},

			{
				displayName: 'Output Fields',
				name: 'outputFields',
				type: 'multiOptions',
				displayOptions: {
					show: {
						operation: ['extract'],
					},
				},
			options: [
				{
					name: 'HTML',
					value: 'html',
					description: 'Full rendered HTML of the page after JavaScript execution',
				},
				{
					name: 'Links',
					value: 'links',
					description: 'All links found on the page with resolved absolute URLs',
				},
				{
					name: 'Media',
					value: 'media',
					description: 'Images, videos, and audio elements with src and alt attributes',
				},
				{
					name: 'Meta Tags',
					value: 'meta',
					description: 'Meta tags including name, property, and content attributes',
				},
				{
					name: 'Structured Data',
					value: 'structured_data',
					description: 'JSON-LD, microdata, Open Graph, and Twitter Card data',
				},
				{
					name: 'Text',
					value: 'text',
					description: 'CSS-aware innerText of the page body — clean, readable content',
				},
			],
			default: ['html', 'text'],
			description: 'Which data fields to extract from the page',
			},

			{
				displayName: 'Timeout (Seconds)',
				name: 'timeout',
				type: 'number',
				displayOptions: {
					show: {
						operation: ['extract', 'scrapeText', 'scrapeLinks', 'scrapeMeta'],
					},
				},
				default: 15,
				description: 'Maximum time to wait for page load and JS execution (1-300 seconds)',
			},

			{
				displayName: 'Additional Options',
				name: 'additionalOptions',
				type: 'collection',
				placeholder: 'Add Option',
				displayOptions: {
					show: {
						operation: ['extract', 'scrapeText', 'scrapeLinks', 'scrapeMeta'],
					},
				},
				default: {},
				options: [
					{
						displayName: 'Allow External Scripts',
						name: 'allowExternalScripts',
						type: 'boolean',
						default: false,
						description: 'Whether to allow execution of cross-origin scripts (default: same-origin only)',
					},
				],
			},

			{
				displayName: 'Crawl Output Fields',
				name: 'crawlOutputFields',
				type: 'multiOptions',
				displayOptions: {
					show: {
						operation: ['crawl'],
					},
				},
			options: [
				{
					name: 'HTML',
					value: 'html',
					description: 'Full rendered HTML of each page',
				},
				{
					name: 'Links',
					value: 'links',
					description: 'All links found on each page',
				},
				{
					name: 'Media',
					value: 'media',
					description: 'Images, videos, and audio from each page',
				},
				{
					name: 'Meta Tags',
					value: 'meta',
					description: 'Meta tags from each page',
				},
				{
					name: 'Structured Data',
					value: 'structured_data',
					description: 'JSON-LD, Open Graph, and microdata from each page',
				},
				{
					name: 'Text',
					value: 'text',
					description: 'Extracted text content from each page',
				},
			],
			default: ['text', 'links'],
			description: 'Which data fields to extract from each crawled page',
			},

			{
				displayName: 'Crawl Options',
				name: 'crawlOptions',
				type: 'collection',
				placeholder: 'Add Option',
				displayOptions: {
					show: {
						operation: ['crawl'],
					},
				},
				default: {},
				options: [
					{
						displayName: 'Max Pages',
						name: 'maxPages',
						type: 'number',
						default: 10,
						description: 'Maximum number of pages to crawl (1-100)',
					},
					{
						displayName: 'Workers',
						name: 'workers',
						type: 'number',
						default: 3,
						description: 'Number of parallel extraction workers (1-10)',
					},
				],
			},
		],
		usableAsTool: true,
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		const credentials = await this.getCredentials('dataGaitApi');
		const baseUrl = (credentials.baseUrl as string).replace(/\/+$/, '');

		for (let i = 0; i < items.length; i++) {
			try {
				const operation = this.getNodeParameter('operation', i) as string;

				if (operation === 'health') {
					const start = Date.now();
					const response = await this.helpers.httpRequestWithAuthentication.call(
						this,
						'dataGaitApi',
						{
							method: 'GET',
							url: `${baseUrl}/health`,
							timeout: 10_000,
						},
					);
					const latencyMs = Date.now() - start;
					returnData.push({
						json: {
							status: 'ok',
							latency_ms: latencyMs,
							...(response as IDataObject),
						},
						pairedItem: { item: i },
					});
					continue;
				}

				const url = this.getNodeParameter('url', i) as string;

				if (operation === 'extract') {
					const outputFields = this.getNodeParameter('outputFields', i, ['html', 'text']) as string[];
					const timeout = this.getNodeParameter('timeout', i, 15) as number;
					const additionalOptions = this.getNodeParameter('additionalOptions', i, {}) as {
						allowExternalScripts?: boolean;
					};

					const qs: Record<string, string> = { url };
					for (const field of outputFields) {
						qs[field] = 'true';
					}
					if (additionalOptions.allowExternalScripts) qs.allow_external_scripts = 'true';

					const response = await this.helpers.httpRequestWithAuthentication.call(
						this,
						'dataGaitApi',
						{
							method: 'GET',
							url: `${baseUrl}/extract`,
							qs,
							returnFullResponse: true,
							timeout: (timeout + 10) * 1000,
						},
					);

					const fullResponse = response as { body: IDataObject; headers: Record<string, string> };
					returnData.push({
						json: buildExtractOutput(fullResponse.body, fullResponse.headers),
						pairedItem: { item: i },
					});

				} else if (operation === 'scrapeText') {
					const timeout = this.getNodeParameter('timeout', i, 15) as number;
					const additionalOptions = this.getNodeParameter('additionalOptions', i, {}) as {
						allowExternalScripts?: boolean;
					};

					const qs: Record<string, string> = { url, text: 'true' };
					if (additionalOptions.allowExternalScripts) qs.allow_external_scripts = 'true';

					const data = await this.helpers.httpRequestWithAuthentication.call(
						this,
						'dataGaitApi',
						{
							method: 'GET',
							url: `${baseUrl}/extract`,
							qs,
							timeout: (timeout + 10) * 1000,
						},
					) as IDataObject;

					returnData.push({
						json: {
							url: data.url,
							title: data.title,
							text: data.text,
							timing_ms: data.timing_ms,
						},
						pairedItem: { item: i },
					});

				} else if (operation === 'scrapeLinks') {
					const timeout = this.getNodeParameter('timeout', i, 15) as number;
					const additionalOptions = this.getNodeParameter('additionalOptions', i, {}) as {
						allowExternalScripts?: boolean;
					};

					const qs: Record<string, string> = { url, links: 'true' };
					if (additionalOptions.allowExternalScripts) qs.allow_external_scripts = 'true';

					const data = await this.helpers.httpRequestWithAuthentication.call(
						this,
						'dataGaitApi',
						{
							method: 'GET',
							url: `${baseUrl}/extract`,
							qs,
							timeout: (timeout + 10) * 1000,
						},
					) as IDataObject;

					returnData.push({
						json: {
							url: data.url,
							title: data.title,
							links: data.links,
							link_count: Array.isArray(data.links) ? (data.links as unknown[]).length : 0,
							timing_ms: data.timing_ms,
						},
						pairedItem: { item: i },
					});

				} else if (operation === 'scrapeMeta') {
					const timeout = this.getNodeParameter('timeout', i, 15) as number;
					const additionalOptions = this.getNodeParameter('additionalOptions', i, {}) as {
						allowExternalScripts?: boolean;
					};

					const qs: Record<string, string> = { url, meta: 'true', structured_data: 'true' };
					if (additionalOptions.allowExternalScripts) qs.allow_external_scripts = 'true';

					const data = await this.helpers.httpRequestWithAuthentication.call(
						this,
						'dataGaitApi',
						{
							method: 'GET',
							url: `${baseUrl}/extract`,
							qs,
							timeout: (timeout + 10) * 1000,
						},
					) as IDataObject;

					returnData.push({
						json: {
							url: data.url,
							title: data.title,
							meta: data.meta,
							structured_data: data.structured_data,
							timing_ms: data.timing_ms,
						},
						pairedItem: { item: i },
					});

				} else if (operation === 'crawl') {
					const crawlOutputFields = this.getNodeParameter('crawlOutputFields', i, ['text', 'links']) as string[];
					const crawlOptions = this.getNodeParameter('crawlOptions', i, {}) as {
						maxPages?: number;
						workers?: number;
					};

					const config: Record<string, unknown> = {};
					for (const field of crawlOutputFields) {
						config[field] = true;
					}
					if (crawlOptions.maxPages) config.max_pages = crawlOptions.maxPages;
					if (crawlOptions.workers) config.workers = crawlOptions.workers;

					const rawResponse = await this.helpers.httpRequestWithAuthentication.call(
						this,
						'dataGaitApi',
						{
							method: 'POST',
							url: `${baseUrl}/crawl`,
							body: { url, config },
							headers: { 'Content-Type': 'application/json' },
							encoding: 'text',
							timeout: 300_000,
						},
					);

					const events = parseSSEData(rawResponse as string);
					const pages: Record<string, unknown>[] = [];
					let summary: Record<string, unknown> | undefined;
					let creditExhausted = false;

					for (const evt of events) {
						const obj = evt as Record<string, unknown>;
						if (obj.type === 'page' && obj.success !== false) {
							pages.push(obj);
						} else if (obj.type === 'done') {
							summary = obj;
						} else if (obj.type === 'credit_exhausted') {
							creditExhausted = true;
							summary = obj;
						}
					}

					const output: IDataObject = {
						url,
						pages,
						page_count: pages.length,
					};
					if (summary) {
						output.total_ms = summary.total_ms as number;
						output.total_credits_used = summary.total_credits_used as number;
					}
					if (creditExhausted) {
						output.credit_exhausted = true;
					}

					returnData.push({
						json: output,
						pairedItem: { item: i },
					});
				}

			} catch (error: unknown) {
				if (this.continueOnFail()) {
					returnData.push({
						json: { error: error instanceof Error ? error.message : String(error) },
						pairedItem: { item: i },
					});
					continue;
				}

				const message = error instanceof Error ? error.message : String(error);

				if (message.includes('QUOTA_EXCEEDED')) {
					throw new NodeOperationError(
						this.getNode(),
						'Your DataGait quota has been exceeded',
						{
							itemIndex: i,
							description: 'Upgrade your plan at https://datagait.com/pricing or wait for your quota to reset.',
						},
					);
				} else if (message.includes('RATE_LIMIT_EXCEEDED')) {
					throw new NodeOperationError(
						this.getNode(),
						'DataGait rate limit reached',
						{
							itemIndex: i,
							description: 'Wait a moment before retrying. Consider adding a delay between requests in your workflow.',
						},
					);
				} else if (message.includes('CONCURRENT_LIMIT_EXCEEDED')) {
					throw new NodeOperationError(
						this.getNode(),
						'Too many concurrent DataGait requests',
						{
							itemIndex: i,
							description: 'Reduce the number of parallel executions or upgrade your plan at https://datagait.com/pricing.',
						},
					);
				}

				// Preserve HTTP status, response body, and other context from n8n HTTP helpers (axios-style errors).
				const errorPayload: JsonObject =
					error !== null && typeof error === 'object'
						? (error as JsonObject)
						: { message: String(error) };
				throw new NodeApiError(this.getNode(), errorPayload, { itemIndex: i });
			}
		}

		return [returnData];
	}
}

function buildExtractOutput(data: IDataObject, headers: Record<string, string>): IDataObject {
	const output: IDataObject = {
		url: data.url,
		title: data.title,
		timing_ms: data.timing_ms,
	};

	if (data.html !== undefined) output.html = data.html;
	if (data.text !== undefined) output.text = data.text;
	if (data.links !== undefined) output.links = data.links;
	if (data.media !== undefined) output.media = data.media;
	if (data.meta !== undefined) output.meta = data.meta;
	if (data.structured_data !== undefined) output.structured_data = data.structured_data;

	if (headers['x-proxy-used']) {
		output.proxy_used = headers['x-proxy-used'] === 'true';
		output.proxy_provider = headers['x-proxy-provider'] as string;
	}

	return output;
}

/**
 * Parse SSE stream where each event is `data: {JSON}\n\n`.
 * The event type is inside the JSON payload as `type` field.
 */
function parseSSEData(raw: string): unknown[] {
	const events: unknown[] = [];
	const blocks = raw.split('\n\n').filter(Boolean);

	for (const block of blocks) {
		const dataLines: string[] = [];

		for (const line of block.split('\n')) {
			if (line.startsWith('data:')) {
				dataLines.push(line.slice(5).trim());
			}
		}

		if (dataLines.length > 0) {
			const dataStr = dataLines.join('\n');
			try {
				events.push(JSON.parse(dataStr));
			} catch {
				// Intentionally ignore: SSE streams may deliver partial `data:` payloads, comments, or
				// heartbeats that are not JSON. Only well-formed JSON events (with `type`, etc.) are used.
			}
		}
	}

	return events;
}
