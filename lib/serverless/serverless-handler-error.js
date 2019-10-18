'use strict';

class ServerlessHandlerError extends Error {

	static get codes() {

		return {
			INVALID_METHOD: 1,
			INVALID_HEADERS: 2,
			INVALID_AUTHENTICATION_DATA: 3
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
