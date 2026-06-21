import {
	ICredentialType,
	INodeProperties,
	ICredentialTestRequest,
} from 'n8n-workflow';

export class PollinationsApi implements ICredentialType {
	name = 'pollinationsApi';
	displayName = 'Pollinations API';
	documentationUrl = 'https://enter.pollinations.ai';
	icon = 'file:pollinations.svg' as const;
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

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://gen.pollinations.ai/v1',
			url: '/models',
			method: 'GET',
			headers: {
				'Authorization': '=Bearer {{$credentials.apiKey || "anonymous-token"}}',
			},
		},
	};
}
