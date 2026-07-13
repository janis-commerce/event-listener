'use strict';

const { ApiResponse } = require('@janiscommerce/sls-api-response');

const Events = require('@janiscommerce/events');
const Log = require('@janiscommerce/log');

const Dispatcher = require('./dispatcher');

module.exports = class ServerlessHandler {

	static async handle(Listener, event, context) {

		process.env.AWS_LAMBDA_REQUEST_ID = context?.awsRequestId || '';

		Log.start();

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

			await this.emitEnded();

			return ApiResponse.send({
				statusCode: 400,
				body: {
					message: e.message
				}
			});
		}

		const result = await dispatcher.dispatch();

		await this.emitEnded();

		return ApiResponse.send({
			statusCode: result.code,
			body: result.body,
			headers: result.headers,
			cookies: result.cookies
		});
	}

	static async emitEnded() {
		await Events.emit('janiscommerce.ended');
	}
};
