'use strict';

const { ApiResponse } = require('@janiscommerce/sls-api-response');
const Events = require('@janiscommerce/events');
const Dispatcher = require('./dispatcher');


module.exports = class ServerlessHandler {

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

			await this.emitEnded();

			return ApiResponse.send({
				statusCode: 400,
				body: {
					message: e.message
				}
			});
		}

		await this.emitEnded();

		const result = await dispatcher.dispatch();

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
