'use strict';

class EventListenerError extends Error {

	static get codes() {

		return {
			MISSING_EVENT: 1,
			INVALID_EVENT: 2
		};

	}

	constructor(err, code) {

		const message = err.message || err;

		super(message);
		this.message = message;
		this.code = code;
		this.name = 'EventListenerError';

		if(err instanceof Error)
			this.previousError = err;
	}
}

module.exports = EventListenerError;
