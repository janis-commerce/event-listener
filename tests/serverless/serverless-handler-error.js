'use strict';

const assert = require('assert').strict;

const ServerlessHandlerError = require('../../lib/serverless/serverless-handler-error');

describe('Serverless Handler Error', () => {

	it('Should accept a message error and a code', () => {
		const error = new ServerlessHandlerError('Some error', ServerlessHandlerError.codes.INVALID_EVENT);

		assert.strictEqual(error.message, 'Some error');
		assert.strictEqual(error.code, ServerlessHandlerError.codes.INVALID_EVENT);
		assert.strictEqual(error.name, 'ServerlessHandlerError');
	});

	it('Should accept an error instance and a code', () => {

		const previousError = new Error('Some error');

		const error = new ServerlessHandlerError(previousError, ServerlessHandlerError.codes.INVALID_EVENT);

		assert.strictEqual(error.message, 'Some error');
		assert.strictEqual(error.code, ServerlessHandlerError.codes.INVALID_EVENT);
		assert.strictEqual(error.name, 'ServerlessHandlerError');
		assert.strictEqual(error.previousError, previousError);
	});
});
