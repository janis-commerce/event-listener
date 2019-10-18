'use strict';

const { ApiResponse } = require('@janiscommerce/sls-api-response');
const Dispatcher = require('./dispatcher');

class ServerlessHandler {

	static async handle(Listener, event) {

		// This is a custom template property.
		// Native support was suggested in https://github.com/serverless/serverless/issues/6364
		if(!event.requestPath) {
			return ApiResponse.send({
				statusCode: 500,
				body: {
					message: 'requestPath not present in event object. Add a custom request mapping template to add it'
				}
			});
		}

		const {
			headers,
			body: data
		} = event;

		const method = event.method && event.method.toLowerCase();
		const endpoint = this._buildEndpoint(event.requestPath, event.path);
		const authenticationData = event.authorizer && event.authorizer.janisAuth && JSON.parse(event.authorizer.janisAuth);

		let dispatcher;

		try {
			dispatcher = new Dispatcher(Listener, {
				endpoint,
				method,
				data,
				headers,
				authenticationData
			});
		} catch(e) {
			return ApiResponse.send({
				statusCode: 400,
				body: {
					message: e.message
				}
			});
		}

		const result = await dispatcher.dispatch();

		return ApiResponse.send({
			statusCode: result.code,
			body: result.body,
			headers: result.headers,
			cookies: result.cookies
		});
	}

	static _buildEndpoint(requestPath, pathVariables) {

		requestPath = requestPath.replace(/^\//, '');

		if(!pathVariables)
			return requestPath;

		return Object.entries(pathVariables).reduce((endpoint, [key, value]) => endpoint.replace(`{${key}}`, value), requestPath);
	}

}

module.exports = ServerlessHandler;
