'use strict';

const { ApiResponse } = require('@janiscommerce/sls-api-response');
const Dispatcher = require('./dispatcher');

class ServerlessHandler {

	static async handle(Listener, event) {

		const {
			headers,
			body: data
		} = event;

		const method = event.method && event.method.toLowerCase();
		const authenticationData = event.authorizer && event.authorizer.janisAuth && JSON.parse(event.authorizer.janisAuth);

		let dispatcher;

		try {
			dispatcher = new Dispatcher(Listener, {
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

}

module.exports = ServerlessHandler;
