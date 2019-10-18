'use strict';

const assert = require('assert').strict;

const { EventListenerError } = require('../lib');

describe('Event Listener Error', () => {

	it('Should accept a message error and a code', () => {
		const error = new EventListenerError('Some error', EventListenerError.codes.INVALID_EVENT);

		assert.strictEqual(error.message, 'Some error');
		assert.strictEqual(error.code, EventListenerError.codes.INVALID_EVENT);
		assert.strictEqual(error.name, 'EventListenerError');
	});

	it('Should accept an error instance and a code', () => {

		const previousError = new Error('Some error');

		const error = new EventListenerError(previousError, EventListenerError.codes.INVALID_EVENT);

		assert.strictEqual(error.message, 'Some error');
		assert.strictEqual(error.code, EventListenerError.codes.INVALID_EVENT);
		assert.strictEqual(error.name, 'EventListenerError');
		assert.strictEqual(error.previousError, previousError);
	});
});
