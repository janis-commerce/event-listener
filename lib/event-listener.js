'use strict';

const { API } = require('@janiscommerce/api');

const EventListenerError = require('./event-listener-error');

const EventValidator = require('./event-validator');

class EventListener extends API {

	get shouldCreateLog() {
		return false;
	}

	get mustHaveClient() {
		return false;
	}

	get mustHaveId() {
		return false;
	}

	get event() {
		return this.data;
	}

	get eventService() {
		return this.event && this.event.service;
	}

	get eventEntity() {
		return this.event && this.event.entity;
	}

	get eventName() {
		return this.event && this.event.event;
	}

	get eventClient() {
		return this.event && this.event.client;
	}

	get eventId() {
		return this.event && this.event.id;
	}

	async validate() {

		if(!this.event)
			throw	new EventListenerError('Missing event data', EventListenerError.codes.MISSING_EVENT);

		try {
			EventValidator.validate(this.event, this.mustHaveClient, this.mustHaveId);
		} catch(e) {
			throw new EventListenerError(e, EventListenerError.codes.INVALID_EVENT);
		}
	}

}

module.exports = EventListener;
