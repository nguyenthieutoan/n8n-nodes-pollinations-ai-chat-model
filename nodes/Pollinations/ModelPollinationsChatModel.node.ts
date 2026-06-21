import * as path from 'path';
import * as fs from 'fs';
import {
	INodeType,
	INodeTypeDescription,
	ISupplyDataFunctions,
	SupplyData,
	NodeConnectionTypes,
	INodePropertyOptions,
	ILoadOptionsFunctions,
} from 'n8n-workflow';

// Helper to resolve dependencies from n8n core's own runtime.
// This ensures we load the exact same class instance n8n uses internally.
function requireN8nDependency(dependencyName: string): any {
	// 1. Try normal require first
	try { return require(dependencyName); } catch (_) {}

	// 2. Resolve relative to require.main (n8n itself)
	if (require.main) {
		try {
			const p = require.resolve(dependencyName, { paths: require.main.paths });
			return require(p);
		} catch (_) {}
	}

	// 3. Walk up from n8n-workflow
	try {
		const workflowPath = require.resolve('n8n-workflow');
		let dir = path.dirname(workflowPath);
		while (dir && dir !== path.parse(dir).root) {
			const candidate = path.join(dir, 'node_modules', dependencyName);
			try {
				if (fs.existsSync(candidate)) return require(candidate);
			} catch (_) {}
			dir = path.dirname(dir);
		}
	} catch (_) {}

	// 4. Hardcoded fallback paths
	const fallbacks = [
		'/usr/local/lib/node_modules/n8n/node_modules',
		'/usr/local/lib/node_modules/n8n/packages/@n8n/nodes-langchain/node_modules',
		path.join(process.env.APPDATA || '', 'npm/node_modules/n8n/node_modules'),
		path.join(process.env.APPDATA || '', 'npm/node_modules/n8n/packages/@n8n/nodes-langchain/node_modules'),
	];
	for (const base of fallbacks) {
		try {
			const p = path.join(base, dependencyName);
			if (fs.existsSync(p)) return require(p);
		} catch (_) {}
	}

	throw new Error(`Could not resolve ${dependencyName} from n8n's runtime`);
}

let prototypePatched = false;

export class ModelPollinationsChatModel implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Pollinations Chat Model',
		name: 'modelPollinationsChatModel',
		icon: {
			light: 'file:icon-light-mode.png',
			dark: 'file:icon-dark-mode.png',
		},
		group: ['transform'],
		version: 1,
		description: 'Provides large language models from Pollinations.ai for intelligent agents',
		defaults: {
			name: 'Pollinations Chat Model',
		},
		codex: {
			categories: ['AI'],
			subcategories: {
				AI: ['Language Models'],
				'Language Models': ['Chat Models (Recommended)'],
			},
		},
		inputs: [],
		outputs: [NodeConnectionTypes.AiLanguageModel],
		outputNames: ['Model'],
		credentials: [
			{
				name: 'pollinationsApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Model',
				name: 'model',
				type: 'options',
				description: 'The model which will generate the completion. Learn more about available models at Pollinations.ai.',
				typeOptions: {
					loadOptionsMethod: 'getAvailableModels',
				},
				default: 'openai',
			},
			{
				displayName: 'Options',
				name: 'options',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				options: [
					{
						displayName: 'Frequency Penalty',
						name: 'frequencyPenalty',
						type: 'number',
						typeOptions: {
							minValue: -2,
							maxValue: 2,
						},
						default: 0.0,
						description: 'Positive values penalize new tokens based on their existing frequency in the text so far, decreasing the model\'s likelihood to repeat the same line verbatim.',
					},
					{
						displayName: 'Maximum Number of Tokens',
						name: 'maxTokens',
						type: 'number',
						typeOptions: {
							minValue: -1,
						},
						default: -1,
						description: 'The maximum number of tokens to generate in the completion. Set to -1 to use the model\'s default maximum.',
					},
					{
						displayName: 'Response Format',
						name: 'responseFormat',
						type: 'options',
						options: [
							{ name: 'Text', value: 'text' },
							{ name: 'JSON Object', value: 'json_object' },
						],
						default: 'text',
						description: 'The format in which the model returns the output. Select JSON Object to enable JSON mode, ensuring the model outputs valid JSON.',
					},
					{
						displayName: 'Presence Penalty',
						name: 'presencePenalty',
						type: 'number',
						typeOptions: {
							minValue: -2,
							maxValue: 2,
						},
						default: 0.0,
						description: 'Positive values penalize new tokens based on whether they appear in the text so far, increasing the model\'s likelihood to talk about new topics.',
					},
					{
						displayName: 'Sampling Temperature',
						name: 'temperature',
						type: 'number',
						typeOptions: {
							minValue: 0,
							maxValue: 2,
						},
						default: 0.7,
						description: 'Controls randomness: lowering results in less random completions. As the temperature approaches zero, the model will become deterministic and repetitive.',
					},
					{
						displayName: 'Timeout',
						name: 'timeout',
						type: 'number',
						typeOptions: {
							minValue: 1,
						},
						default: 60000,
						description: 'Maximum amount of time (in milliseconds) a request is allowed to take.',
					},
					{
						displayName: 'Max Retries',
						name: 'maxRetries',
						type: 'number',
						typeOptions: {
							minValue: 0,
						},
						default: 2,
						description: 'Maximum number of times to retry the request if the first attempt fails.',
					},
					{
						displayName: 'Top P',
						name: 'topP',
						type: 'number',
						typeOptions: {
							minValue: 0,
							maxValue: 1,
						},
						default: 1.0,
						description: 'An alternative to sampling with temperature, called nucleus sampling. The model considers the results of the tokens with top_p probability mass.',
					},
					{
						displayName: 'Seed',
						name: 'seed',
						type: 'number',
						default: 0,
						description: 'If specified, system will make a best effort to sample deterministically, so repeated requests with the same seed and parameters return the same result.',
					},
					{
						displayName: 'Safe Mode',
						name: 'safe',
						type: 'string',
						default: 'false',
						description: 'Enable content filters (e.g. "privacy, secrets, violence" or "true" for all).',
					},
					{
						displayName: 'Reasoning Effort',
						name: 'reasoningEffort',
						type: 'options',
						options: [
							{ name: 'Low', value: 'low' },
							{ name: 'Medium', value: 'medium' },
							{ name: 'High', value: 'high' },
						],
						default: 'medium',
						description: 'Constrains reasoning effort for reasoning models (e.g., DeepSeek-R1).',
					},
				],
			},
		],
	};

	methods = {
		loadOptions: {
			// Dynamic model discovery: fetch available models from the API
			async getAvailableModels(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				try {
					const response = await this.helpers.httpRequest({
						method: 'GET',
						url: 'https://gen.pollinations.ai/v1/models',
						json: true,
					}) as any;

					if (response && response.data && Array.isArray(response.data)) {
						const chatModels = response.data.filter((item: any) =>
							item.supported_endpoints && item.supported_endpoints.includes('/v1/chat/completions')
						);
						if (chatModels.length > 0) {
							return chatModels.map((item: any) => ({
								name: item.id + (item.reasoning ? ' (Reasoning)' : ''),
								value: item.id,
							}));
						}
					}

					return [
						{ name: 'OpenAI GPT-4o (openai)', value: 'openai' },
						{ name: 'Claude 3.5 Sonnet (claude)', value: 'claude' },
						{ name: 'Gemini 1.5 Pro (gemini)', value: 'gemini' },
						{ name: 'DeepSeek V3 (deepseek)', value: 'deepseek' },
						{ name: 'Mistral Large (mistral)', value: 'mistral' },
					];
				} catch (error) {
					// Static fallback if the API request fails
					return [
						{ name: 'OpenAI GPT-4o (openai)', value: 'openai' },
						{ name: 'Claude 3.5 Sonnet (claude)', value: 'claude' },
						{ name: 'Gemini 1.5 Pro (gemini)', value: 'gemini' },
						{ name: 'DeepSeek V3 (deepseek)', value: 'deepseek' },
						{ name: 'Mistral Large (mistral)', value: 'mistral' },
					];
				}
			},
		},
	};

	async supplyData(this: ISupplyDataFunctions, itemIndex: number = 0): Promise<SupplyData> {
		const credentials = await this.getCredentials('pollinationsApi').catch(() => undefined);
		const apiKey = credentials?.apiKey as string;

		const modelName = this.getNodeParameter('model', itemIndex, 'openai') as string;
		const options = this.getNodeParameter('options', itemIndex, {}) as {
			frequencyPenalty?: number;
			maxTokens?: number;
			responseFormat?: string;
			presencePenalty?: number;
			temperature?: number;
			timeout?: number;
			maxRetries?: number;
			topP?: number;
			seed?: number;
			safe?: string;
			reasoningEffort?: string;
		};

		const temperature = options.temperature ?? 0.7;
		const maxTokens = (options.maxTokens === undefined || options.maxTokens === -1) ? undefined : options.maxTokens;
		const frequencyPenalty = options.frequencyPenalty ?? 0.0;
		const presencePenalty = options.presencePenalty ?? 0.0;
		const topP = options.topP ?? 1.0;
		const timeout = options.timeout ?? 60000;
		const maxRetries = options.maxRetries ?? 2;

		// ─── CRITICAL: load from n8n's OWN runtime, same instance as n8n internals ───
		const { ChatOpenAI } = requireN8nDependency('@langchain/openai');
		const { N8nLlmTracing, logWrapper } = requireN8nDependency('@n8n/ai-utilities');

		// Vá lỗi kiểm tra Prototype (instanceof Mismatch) theo Quy Chuẩn n8n
		if (!prototypePatched) {
			try {
				const aiUtilitiesPath = require.resolve('@n8n/ai-utilities');
				const langchainLanguageModelPath = require.resolve('@langchain/core/language_models/base', { paths: [aiUtilitiesPath] });
				const ParentLMClass = require(langchainLanguageModelPath).BaseLanguageModel;
				if (ParentLMClass && ParentLMClass.prototype) {
					Object.setPrototypeOf(ChatOpenAI.prototype, ParentLMClass.prototype);
				}
				prototypePatched = true;
			} catch (e) {}
		}

		// Base configuration for OpenAI Chat completions mapping
		const configuration: Record<string, any> = {
			modelName,
			temperature,
			maxTokens,
			frequencyPenalty,
			presencePenalty,
			topP,
			timeout,
			maxRetries,
			apiKey: apiKey || 'anonymous-token',
			openAIApiKey: apiKey || 'anonymous-token',
			baseURL: 'https://gen.pollinations.ai/v1',
			configuration: {
				baseURL: 'https://gen.pollinations.ai/v1',
				apiKey: apiKey || 'anonymous-token',
			},
			callbacks: [new N8nLlmTracing(this)],
		};

		// Configure response format
		const modelKwargs: Record<string, any> = {};

		if (options.responseFormat === 'json_object') {
			modelKwargs.response_format = { type: 'json_object' };
		}

		// Map Pollinations-specific parameters
		if (options.seed !== undefined && options.seed !== 0) {
			modelKwargs.seed = options.seed;
		}
		if (options.safe && options.safe !== 'false') {
			modelKwargs.safe = options.safe;
		}
		if (options.reasoningEffort) {
			modelKwargs.reasoning_effort = options.reasoningEffort;
		}

		if (Object.keys(modelKwargs).length > 0) {
			configuration.modelKwargs = modelKwargs;
		}

		// Instantiate LangChain ChatOpenAI object from n8n core's dependency tree
		const modelInstance = new ChatOpenAI(configuration);

		return {
			response: logWrapper(modelInstance, this),
		};
	}
}
