# event-listener

![Build Status](https://github.com/janis-commerce/event-listener/workflows/Build%20Status/badge.svg)
[![Coverage Status](https://coveralls.io/repos/github/janis-commerce/event-listener/badge.svg?branch=master)](https://coveralls.io/github/janis-commerce/event-listener?branch=master)
[![npm version](https://badge.fury.io/js/%40janiscommerce%2Fevent-listener.svg)](https://www.npmjs.com/package/@janiscommerce/event-listener)

An API handler to implement event listeners

## Installation
```sh
npm install @janiscommerce/event-listener
```

## EventListener

This is the class you should extend to code your own Listeners. You can customize them with the following methods and getters:

### async validate()
This optional method should throw an Error in case of validation failure. It's message will be set in the response body. It's return value will be discarded.
If you dont implement this method, it will automatically validate your event structure.

**IMPORTANT** If you implement it, remember to always call `super.validate()` before so your event structure get validated for you.

### async process()
This method is required, and should have the logic of your API. At this point, request should be already validated. If you throw an error here, default http code is set to 500.

The following methods will be inherited from the base API Class:

### Getters

* **mustHaveClient** (*getter*).
Indicates whether the events must have the `client` property present when validating it. Default is false.

* **mustHaveId** (*getter*).
Indicates whether the events must have the `id` property present when validating it. Default is false.

* **event** (*getter*).
Returns the event object

* **eventService** (*getter*).
Returns the event source service

* **eventEntity** (*getter*).
Returns the event entity

* **eventName** (*getter*).
Returns the event name

* **eventClient** (*getter*).
Returns the event client if present or `undefined` otherwise.

* **eventId** (*getter*).
Returns the event id if present or `undefined` otherwise.

### Others

You can also use getters and setters defined in [@janiscommerce/api](https://www.npmjs.com/package/@janiscommerce/api).

## ServerlessHandler

This is the class you should use as a handler for your AWS Lambda functions.

### async handle(Listener, event, context, callback)
This will handle the lambda execution.
* Listener {Class} The event listener class. It's recommended to extend from this package `EventListener` class.
* event {object} The lambda event object
* context {object} The lambda context object
* callback {function} The lambda callback function


## EventListenerError

Handled runtime errors of the event listener. You might find more information about the error source in the `previousError` property.

It also uses the following error codes:

| Name | Value | Description |
| --- | --- | --- |
| Missing event | 1 | The request body is empty |
| Invalid event | 2 | The request body has an invalid event object |


## Session injection
*Since 2.0.0*

This package implements [API Session](https://www.npmjs.com/package/@janiscommerce/api-session). In order to associate a request to a session, you must pass a valid authentication data in the `authenticationData` property of the Dispatcher constructor.

Session details and customization details can be found in api-session README.

## Serverless configuration

### Lambda integration event basic function configuration

```yml
ColorUpdatedListener:
  handler: src/listeners/color/updated.handler
  description: Color updated listener
  events:
    - http:
        integration: lambda
        path: listener/profile/created
        method: post
        caching:
          enabled: ${self:custom.apiGatewayCaching.enabled}
        request:
          template: ${file(./serverless/functions/subtemplates/lambda-request-with-path.yml)}
        response: ${file(./serverless/functions/subtemplates/lambda-response-with-cors.yml)}
        # This is for serverless-offline only
        responses: ${file(./serverless/functions/subtemplates/lambda-serverless-offline-responses.yml)}
```


## Listener Examples

### Basic Listener

```js
'use strict';

const {
	EventListener,
	ServerlessHandler
} = require('@janiscommerce/event-listener');

class MyEventListener extends EventListener {

	async process() {
		this.setBody({
			event: this.event
		});
	}

}

module.exports.handler = (...args) => ServerlessHandler.handle(MyEventListener, ...args);
```

### Listener that requires client and id properties in events

```js
'use strict';

const {
	EventListener,
	ServerlessHandler
} = require('@janiscommerce/event-listener');

class MyEventListener extends EventListener {

	get mustHaveClient() {
		return true;
	}

	get mustHaveId() {
		return true;
	}

	async process() {
		this.setBody({
			eventClient: this.eventClient,
			eventId: this.eventId
		});
	}

}

module.exports.handler = (...args) => ServerlessHandler.handle(MyEventListener, ...args);
```

### Injected session Listener

```js
'use strict';

const {
	EventListener,
	ServerlessHandler
} = require('@janiscommerce/event-listener');

const MyModel = require('../../models/mine');

class MyEventListener extends EventListener {

	get mustHaveClient() {
		return true;
	}

	async process() {

		const client = await this.session.client;

		const model = this.session.getSessionInstance(MyModel);

		return model.update({
			someFieldToUpdate: client.status
		}, {
			entity: this.eventEntity
		});
	}

}

module.exports.handler = (...args) => ServerlessHandler.handle(MyEventListener, ...args);
```
