'use strict';

const { ApiSession } = require('@janiscommerce/api-session');
const logger = require('lllog')();

const ServerlessHandlerError = require('./serverless-handler-error');

const isObject = value => typeof value === 'object' && !Array.isArray(value);

class Dispatcher {

	constructor(Listener, request) {

		this._validateRequest(request);

		this.listener = new Listener();
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

			this.setResponseError(code, err, 'Invalid data');
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

			this.setResponseError(code, err, 'Internal server error');
		}
	}

	setResponseError(httpCode, error, defaultMessage) {

		logger.error(this.authenticationData?.clientCode, error);

		this.hasError = true;

		if(!this.listener.response.code)
			this.listener.setCode(httpCode);

		this.listener
			.setBody({ message: error.message || defaultMessage });
	}

	response() {

		if(!this.listener.response.code)
			this.listener.setCode(200);

		return this.listener.response;
	}
}

module.exports = Dispatcher;
