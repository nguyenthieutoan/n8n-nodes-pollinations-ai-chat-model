import {
	ICredentialType,
	INodeProperties,
	ICredentialTestFunctions,
	INodeCredentialTestResult,
} from 'n8n-workflow';

export class PollinationsApi implements ICredentialType {
	name = 'pollinationsApi';
	displayName = 'Pollinations API';
	documentationUrl = 'https://enter.pollinations.ai';
	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			description: 'Enter your API key starting with sk_ from enter.pollinations.ai. If left blank, requests will run anonymously with lower rate limits.',
		},
	];

	// Thiết lập phương thức kiểm tra kết nối sử dụng httpRequest chuẩn theo quy chuẩn n8n
	test: ICredentialTestFunctions = {
		async test(this: ICredentialTestFunctions): Promise<INodeCredentialTestResult> {
			try {
				const apiKey = this.getCredentials('apiKey') as string;
				await this.helpers.httpRequest({
					method: 'GET',
					url: 'https://gen.pollinations.ai/v1/models',
					headers: {
						Authorization: `Bearer ${apiKey || 'anonymous-token'}`,
					},
					json: true,
				});
				return { status: 'success' };
			} catch (error) {
				return {
					status: 'error',
					message: error.message || 'Connection test failed',
				};
			}
		},
	};
}
