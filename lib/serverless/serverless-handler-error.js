'use strict';

class ServerlessHandlerError extends Error {

	static get codes() {

		return {
			INVALID_REQUEST_DATA: 1,
			INVALID_ENDPOINT: 2,
			INVALID_METHOD: 3,
			INVALID_HEADERS: 4,
			INVALID_COOKIES: 5,
			INVALID_AUTHENTICATION_DATA: 6
		};

	}

	constructor(err, code) {

		const message = err.message || err;

		super(message);
		this.message = message;
		this.code = code;
		this.name = 'ServerlessHandlerError';

		if(err instanceof Error)
			this.previousError = err;
	}
}

module.exports = ServerlessHandlerError;
