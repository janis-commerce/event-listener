'use strict';

const assert = require('assert').strict;

const {
	EventListener,
	EventListenerError
} = require('../lib');

describe('Event Listener', () => {

	const sampleEvent = {
		service: 'id',
		client: 'fizzmod',
		entity: 'profile',
		id: '5d699c1ae8ebb95eaa24aca9',
		event: 'created'
	};

	describe('Getters', () => {

		it('Should return false as mustHaveClient and mustHaveId getters default', () => {
			const eventListener = new EventListener();
			assert.strictEqual(eventListener.mustHaveClient, false);
			assert.strictEqual(eventListener.mustHaveId, false);
		});

		it('Should return an empty event and undefined event details if data is empty', () => {
			const eventListener = new EventListener();
			eventListener.data = {};

			assert.deepStrictEqual(eventListener.event, {});
			assert.strictEqual(eventListener.eventService, undefined);
			assert.strictEqual(eventListener.eventEntity, undefined);
			assert.strictEqual(eventListener.eventName, undefined);
			assert.strictEqual(eventListener.eventClient, undefined);
			assert.strictEqual(eventListener.eventId, undefined);
		});

		it('Should return each event details if data is set', () => {
			const eventListener = new EventListener();
			eventListener.data = { ...sampleEvent };

			assert.deepStrictEqual(eventListener.event, { ...sampleEvent });
			assert.strictEqual(eventListener.eventService, 'id');
			assert.strictEqual(eventListener.eventEntity, 'profile');
			assert.strictEqual(eventListener.eventName, 'created');
			assert.strictEqual(eventListener.eventClient, 'fizzmod');
			assert.strictEqual(eventListener.eventId, '5d699c1ae8ebb95eaa24aca9');
		});
	});

	describe('Validation', () => {

		it('Should reject if data is not set', async () => {

			const eventListener = new EventListener();

			await assert.rejects(() => eventListener.validate(), {
				code: EventListenerError.codes.MISSING_EVENT
			});
		});

		it('Should reject if data is not an object', async () => {

			const eventListener = new EventListener();
			eventListener.data = 'hi';

			await assert.rejects(() => eventListener.validate(), {
				code: EventListenerError.codes.INVALID_EVENT
			});

			eventListener.data = [];

			await assert.rejects(() => eventListener.validate(), {
				code: EventListenerError.codes.INVALID_EVENT
			});
		});

		it('Should reject if service property is missing', async () => {

			const { service, ...event } = { ...sampleEvent };

			const eventListener = new EventListener();
			eventListener.data = event;

			await assert.rejects(() => eventListener.validate(), {
				code: EventListenerError.codes.INVALID_EVENT
			});
		});

		it('Should reject if service property is not a string', async () => {

			const { service, ...event } = { ...sampleEvent };

			const eventListener = new EventListener();
			eventListener.data = {
				...event,
				service: ['invalid']
			};

			await assert.rejects(() => eventListener.validate(), {
				code: EventListenerError.codes.INVALID_EVENT
			});
		});

		it('Should reject if entity property is missing', async () => {

			const { entity, ...event } = { ...sampleEvent };

			const eventListener = new EventListener();
			eventListener.data = event;

			await assert.rejects(() => eventListener.validate(), {
				code: EventListenerError.codes.INVALID_EVENT
			});
		});

		it('Should reject if entity property is not a string', async () => {

			const { entity, ...event } = { ...sampleEvent };

			const eventListener = new EventListener();
			eventListener.data = {
				...event,
				entity: ['invalid']
			};

			await assert.rejects(() => eventListener.validate(), {
				code: EventListenerError.codes.INVALID_EVENT
			});
		});

		it('Should reject if event property is missing', async () => {

			const { event: eventName, ...event } = { ...sampleEvent };

			const eventListener = new EventListener();
			eventListener.data = event;

			await assert.rejects(() => eventListener.validate(), {
				code: EventListenerError.codes.INVALID_EVENT
			});
		});

		it('Should reject if event property is not a string', async () => {

			const { event: eventName, ...event } = { ...sampleEvent };

			const eventListener = new EventListener();
			eventListener.data = {
				...event,
				event: ['invalid']
			};

			await assert.rejects(() => eventListener.validate(), {
				code: EventListenerError.codes.INVALID_EVENT
			});
		});

		it('Should reject if client property is not a string', async () => {

			const { client, ...event } = { ...sampleEvent };

			const eventListener = new EventListener();
			eventListener.data = {
				...event,
				client: ['invalid']
			};

			await assert.rejects(() => eventListener.validate(), {
				code: EventListenerError.codes.INVALID_EVENT
			});
		});

		it('Should reject if id property is not a string or a number', async () => {

			const { id, ...event } = { ...sampleEvent };

			const eventListener = new EventListener();
			eventListener.data = {
				...event,
				id: ['invalid']
			};

			await assert.rejects(() => eventListener.validate(), {
				code: EventListenerError.codes.INVALID_EVENT
			});
		});

		class MyEventListener extends EventListener {
			get mustHaveClient() {
				return true;
			}

			get mustHaveId() {
				return true;
			}
		}

		it('Should reject if client property is missing and Listener mustHaveClient', async () => {


			const { client, ...event } = { ...sampleEvent };

			const eventListener = new MyEventListener();
			eventListener.data = {
				...event
			};

			await assert.rejects(() => eventListener.validate(), {
				code: EventListenerError.codes.INVALID_EVENT
			});
		});

		it('Should reject if id property is missing and Listener mustHaveId', async () => {

			const { id, ...event } = { ...sampleEvent };

			const eventListener = new MyEventListener();
			eventListener.data = {
				...event
			};

			await assert.rejects(() => eventListener.validate(), {
				code: EventListenerError.codes.INVALID_EVENT
			});
		});

		it('Should pass validation for minimum valid event', async () => {

			const { client, id, ...event } = { ...sampleEvent };

			const eventListener = new EventListener();
			eventListener.data = {
				...event
			};

			await assert.doesNotReject(() => eventListener.validate());
		});

		it('Should pass validation for full valid event if Listener mustHaveClient and mustHaveId', async () => {

			const eventListener = new MyEventListener();
			eventListener.data = { ...sampleEvent };

			await assert.doesNotReject(() => eventListener.validate());
		});
	});

});
