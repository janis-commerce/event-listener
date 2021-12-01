'use strict';

/**
 * @enum {number}
 * @private
 */
const ERROR_CODES = {
	MISSING_EVENT: 1,
	INVALID_EVENT: 2
};

class EventListenerError extends Error {

	/**
	 * Get the error codes
	 * @returns {ERROR_CODES}
	 */
	static get codes() {
		return ERROR_CODES;
	}

	/**
	 * @param {Error} err The details of the error
	 * @param {ERROR_CODES} code The error code
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
