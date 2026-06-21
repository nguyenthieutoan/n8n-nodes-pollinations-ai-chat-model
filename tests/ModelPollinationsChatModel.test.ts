import { ModelPollinationsChatModel } from '../nodes/Pollinations/ModelPollinationsChatModel.node';
import { PollinationsApi } from '../credentials/PollinationsApi.credentials';
import { ChatOpenAI } from '@langchain/openai';

jest.mock('@langchain/openai', () => {
	return {
		ChatOpenAI: jest.fn().mockImplementation((config) => {
			return {
				config,
				id: 'mock-chat-openai-instance',
			};
		}),
	};
});

jest.mock('@n8n/ai-utilities', () => {
	return {
		logWrapper: jest.fn().mockImplementation((instance) => instance),
		N8nLlmTracing: jest.fn().mockImplementation(() => {
			return {};
		}),
	};
});

describe('Pollinations Chat Model Community Node', () => {
	let node: ModelPollinationsChatModel;

	beforeEach(() => {
		node = new ModelPollinationsChatModel();
		jest.clearAllMocks();
	});

	test('should define correct node description', () => {
		expect(node.description.displayName).toBe('Pollinations Chat Model');
		expect(node.description.name).toBe('modelPollinationsChatModel');
		expect(node.description.icon).toEqual({
			light: 'file:icon-light-mode.png',
			dark: 'file:icon-dark-mode.png',
		});
		expect(node.description.inputs).toEqual([]);
		expect(node.description.outputs).toContain('ai_languageModel');
	});

	describe('loadOptions - getAvailableModels', () => {
		test('should fetch and return filtered chat models from API', async () => {
			const mockResponse = {
				data: [
					{
						id: 'model-1',
						supported_endpoints: ['/v1/chat/completions', '/text'],
						reasoning: true,
					},
					{
						id: 'model-2',
						supported_endpoints: ['/v1/images/generations'],
					},
					{
						id: 'model-3',
						supported_endpoints: ['/v1/chat/completions'],
						reasoning: false,
					},
				],
			};

			const mockContext = {
				helpers: {
					httpRequest: jest.fn().mockResolvedValue(mockResponse),
				},
			} as any;

			const models = await node.methods.loadOptions.getAvailableModels.call(mockContext);

			expect(mockContext.helpers.httpRequest).toHaveBeenCalledWith({
				method: 'GET',
				url: 'https://gen.pollinations.ai/v1/models',
				json: true,
			});

			expect(models).toEqual([
				{ name: 'model-1 (Reasoning)', value: 'model-1' },
				{ name: 'model-3', value: 'model-3' },
			]);
		});

		test('should fall back to static list on request failure', async () => {
			const mockContext = {
				helpers: {
					httpRequest: jest.fn().mockRejectedValue(new Error('Network Error')),
				},
			} as any;

			const models = await node.methods.loadOptions.getAvailableModels.call(mockContext);

			expect(models).toHaveLength(5);
			expect(models[0]).toEqual({ name: 'OpenAI GPT-4o (openai)', value: 'openai' });
		});
	});

	describe('supplyData', () => {
		test('should instantiate ChatOpenAI with correct configurations (Anonymous)', async () => {
			const mockParameters: Record<string, any> = {
				model: 'gpt-5.4',
				options: {
					temperature: 0.8,
					maxTokens: 2048,
					responseFormat: 'json_object',
					seed: 123,
					safe: 'privacy,violence',
					reasoningEffort: 'high',
				},
			};

			const mockContext = {
				getCredentials: jest.fn().mockRejectedValue(new Error('No credentials')),
				getNodeParameter: jest.fn().mockImplementation((name, index, defaultValue) => {
					const actualDefault = defaultValue !== undefined ? defaultValue : index;
					return mockParameters[name] !== undefined ? mockParameters[name] : actualDefault;
				}),
			} as any;

			const result = await node.supplyData.call(mockContext);

			expect(ChatOpenAI).toHaveBeenCalledWith(expect.objectContaining({
				modelName: 'gpt-5.4',
				temperature: 0.8,
				maxTokens: 2048,
				apiKey: 'anonymous-token',
				openAIApiKey: 'anonymous-token',
				baseURL: 'https://gen.pollinations.ai/v1',
				configuration: {
					baseURL: 'https://gen.pollinations.ai/v1',
					apiKey: 'anonymous-token',
				},
				modelKwargs: {
					response_format: { type: 'json_object' },
					seed: 123,
					safe: 'privacy,violence',
					reasoning_effort: 'high',
				},
			}));

			expect(result.response).toBeDefined();
		});

		test('should use credential apiKey when provided', async () => {
			const mockParameters: Record<string, any> = {
				model: 'openai',
				options: {
					temperature: 0.5,
					maxTokens: 100,
				},
			};

			const mockContext = {
				getCredentials: jest.fn().mockResolvedValue({ apiKey: 'sk_test_key_123' }),
				getNodeParameter: jest.fn().mockImplementation((name, index, defaultValue) => {
					const actualDefault = defaultValue !== undefined ? defaultValue : index;
					return mockParameters[name] !== undefined ? mockParameters[name] : actualDefault;
				}),
			} as any;

			await node.supplyData.call(mockContext);

			expect(ChatOpenAI).toHaveBeenCalledWith(expect.objectContaining({
				openAIApiKey: 'sk_test_key_123',
			}));
		});
	});
});

describe('Pollinations API Credentials', () => {
	let credentials: PollinationsApi;

	beforeEach(() => {
		credentials = new PollinationsApi();
	});

	test('should define correct properties', () => {
		expect(credentials.name).toBe('pollinationsApi');
		expect(credentials.displayName).toBe('Pollinations API');
		expect(credentials.properties).toHaveLength(1);
		expect(credentials.properties[0].name).toBe('apiKey');
		expect(credentials.properties[0].typeOptions?.password).toBe(true);
	});

	describe('test configuration', () => {
		test('should define correct test request options', () => {
			expect(credentials.test.request.method).toBe('GET');
			expect(credentials.test.request.url).toBe('/models');
			expect(credentials.test.request.baseURL).toBe('https://gen.pollinations.ai/v1');
			expect(credentials.test.request.headers?.Authorization).toBe('=Bearer {{$credentials.apiKey || "anonymous-token"}}');
		});
	});
});
