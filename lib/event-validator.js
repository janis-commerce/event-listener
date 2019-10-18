'use strict';

const assert = require('assert').strict;
const { inspect } = require('util');

class EventValidator {

	static validate(event, mustHaveClient, mustHaveId) {

		if(typeof event !== 'object' || Array.isArray(event))
			throw	new Error(`Event should be an object. Received ${inspect(event)}`);

		assert.ok(event.service, 'Missing required property service');
		assert.strictEqual(typeof event.service, 'string', `Event service should be a string. Received ${inspect(event.service)}`);

		assert.ok(event.entity, 'Missing required property entity');
		assert.strictEqual(typeof event.entity, 'string', `Event entity should be a string. Received ${inspect(event.entity)}`);

		assert.ok(event.event, 'Missing required property event');
		assert.strictEqual(typeof event.event, 'string', `Event event name should be a string. Received ${inspect(event.event)}`);

		if(mustHaveClient)
			assert.ok(event.client, 'Missing required property client');

		if(event.client !== undefined)
			assert.strictEqual(typeof event.client, 'string', `Event client should be a string. Received ${inspect(event.client)}`);

		if(mustHaveId)
			assert.ok(event.id, 'Missing required property id');

		if(event.id !== undefined)
			assert.ok(typeof event.id === 'string' || typeof event.id === 'number', `Event id should be a string ar a number. Received ${inspect(event.id)}`);
	}

}

module.exports = EventValidator;
