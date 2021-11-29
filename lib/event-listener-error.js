'use strict';

/**
 * @typedef CodesError
 * @property {Number} MISSING_EVENT
 * @property {Number} INVALID_EVENT
 */

class EventListenerError extends Error {

	/**
	 * Get the error codes
	 * @returns {CodesError}
	 */
	static get codes() {

		return {
			MISSING_EVENT: 1,
			INVALID_EVENT: 2
		};

	}

	/**
	 * @param {Error} err The details of the error
	 * @param {Number} code The error code
	 */
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
