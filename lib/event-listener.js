'use strict';

const { API } = require('@janiscommerce/api');

const EventListenerError = require('./event-listener-error');

const EventValidator = require('./event-validator');

/**
 * @typedef {Object} EventListenerError An instance of EventListenerError class
 */

class EventListener extends API {

	/**
	 * @returns {boolean}
	 */
	get shouldCreateLog() {
		return false;
	}

	/**
	 * Indicates whether the events must have the client property present when validating it
	 * @returns {boolean}
	 */
	get mustHaveClient() {
		return false;
	}

	/**
	 * Indicates whether the events must have the id property present when validating it
	 * @returns {boolean}
	 */
	get mustHaveId() {
		return false;
	}

	/**
	 * Get the event object
	 * @returns {Object}
	 */
	get event() {
		return this.data;
	}

	/**
	 * Get the event source service
	 * @returns {String | undefined}
	 */
	get eventService() {
		return this.event && this.event.service;
	}

	/**
	 * Get the event entity
	 * @returns {String | undefined}
	 */
	get eventEntity() {
		return this.event && this.event.entity;
	}

	/**
	 * Get the event name
	 * @returns {String | undefined}
	 */
	get eventName() {
		return this.event && this.event.event;
	}

	/**
	 * Get the event client if present or undefined otherwise.
	 * @returns {String | undefined}
	 */
	get eventClient() {
		return this.event && this.event.client;
	}

	/**
	 * Get the event id if present or undefined otherwise.
	 * @returns {String | undefined}
	 */
	get eventId() {
		return this.event && this.event.id;
	}

	/**
	 * Validates if the event property exists and if this is a valid event
	 * @returns {Promise<void>}
	 * @throws {EventListenerError} If event is not exist or is not valid
	 */
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
