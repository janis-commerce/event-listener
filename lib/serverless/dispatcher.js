'use strict';

const { ApiSession } = require('@janiscommerce/api-session');

const ServerlessHandlerError = require('./serverless-handler-error');

const isObject = value => typeof value === 'object' && !Array.isArray(value);

class Dispatcher {

	constructor(Listener, request) {

		this._validateRequest(request);

		this.listener = new Listener();
		this.endpoint = request.endpoint.replace(/^\/?(api\/)?/i, '');
		this.method = (request.method || 'post').toLowerCase();
		this.data = request.data;
		this.headers = request.headers || {};
		this.cookies = {};
		this.authenticationData = request.authenticationData;
	}

	/**
	 * Validates the request
	 *
	 * @param {any} request The request data
	 */
	_validateRequest(request) {

		if(typeof request.method !== 'undefined'
			&& request.method !== 'post')
			throw new ServerlessHandlerError('Method must be POST', ServerlessHandlerError.codes.INVALID_METHOD);

		if(typeof request.headers !== 'undefined'
			&& !isObject(request.headers))
			throw new ServerlessHandlerError('Headers must be an Object', ServerlessHandlerError.codes.INVALID_HEADERS);

		if(typeof request.authenticationData !== 'undefined'
			&& !isObject(request.authenticationData))
			throw new ServerlessHandlerError('Authentication Data must be an Object', ServerlessHandlerError.codes.INVALID_AUTHENTICATION_DATA);
	}

	/**
	 * API Dispatch
	 *
	 */
	async dispatch() {

		this.prepare();

		await this.setSession();

		await this.validate();

		await this.process();

		return this.response();
	}

	prepare() {
		this.listener.method = this.method;
		this.listener.endpoint = this.endpoint;
		this.listener.data = this.data;
		this.listener.pathParameters = [];
		this.listener.headers = this.headers;
		this.listener.cookies = this.cookies;
	}

	async setSession() {
		this.listener.session = new ApiSession(this.authenticationData);
	}

	async validate() {

		try {

			// API request validation
			if(this.listener.validate)
				await this.listener.validate();

		} catch(err) {

			const code = 400;
			const message = err.message || 'Invalid data';

			this.setResponseError(message, code);
		}
	}

	async process() {

		if(this.hasError)
			return;

		try {

			// call api controller process
			await this.listener.process();

		} catch(err) {

			const code = 500;
			const message = err.message || 'Internal server error';

			this.setResponseError(message, code);
		}
	}

	setResponseError(message, httpCode) {
		this.hasError = true;

		if(!this.listener.response.code)
			this.listener.setCode(httpCode);

		this.listener
			.setBody({ message });
	}

	response() {

		if(!this.listener.response.code)
			this.listener.setCode(200);

		return this.listener.response;
	}
}

module.exports = Dispatcher;
