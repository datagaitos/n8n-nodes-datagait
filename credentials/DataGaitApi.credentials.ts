import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class DataGaitApi implements ICredentialType {
	name = 'dataGaitApi';
	displayName = 'DataGait API';
	documentationUrl = 'https://www.npmjs.com/package/n8n-nodes-datagait';
	icon = 'file:../nodes/DataGait/datagait.svg' as const;
	properties: INodeProperties[] = [
		{
			displayName: 'API Token',
			name: 'apiToken',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
			placeholder: 'dg_live_xxxxxxxxxxxxx',
			description: 'Get your API token from <a href="https://datagait.com/dashboard/settings" target="_blank">DataGait Settings</a>',
		},
		{
			displayName: 'API Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'https://ingest.datagait.com',
			description: 'Base URL for DataGait API. Change only if using a self-hosted instance.',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				'X-API-Key': '={{$credentials.apiToken}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.baseUrl}}',
			url: '/health',
			method: 'GET',
		},
	};
}
