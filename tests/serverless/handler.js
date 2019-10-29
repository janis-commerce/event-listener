'use strict';

const sinon = require('sinon');

const { ApiResponse } = require('@janiscommerce/sls-api-response');

const { EventListener } = require('../../lib');
const ServerlessHandler = require('../../lib/serverless/handler');

describe('Serverless Handler', () => {

	class MyEventListener extends EventListener {
		async process() {
			this.setBody({
				...this.event
			});
		}
	}

	const sampleEvent = {
		service: 'id',
		client: 'fizzmod',
		entity: 'profile',
		id: '5d699c1ae8ebb95eaa24aca9',
		event: 'created'
	};

	const sampleServerlessEvent = {
		headers: {
			'x-foo': 'bar'
		},
		method: 'POST',
		body: {
			...sampleEvent
		},
		path: {},
		authorizer: {
			janisAuth: JSON.stringify({ clientCode: 'fizzmod' })
		}
	};

	describe('Handle', () => {

		afterEach(() => {
			sinon.restore();
		});

		context('Validation errors', () => {

			it('Should return a 400 http error if request headers are not an object', async () => {

				const apiResponseStub = sinon.stub(ApiResponse, 'send');

				const { headers, ...slsEvent } = { ...sampleServerlessEvent };

				await ServerlessHandler.handle(MyEventListener, {
					...slsEvent,
					headers: []
				});

				sinon.assert.calledOnce(apiResponseStub);
				sinon.assert.calledWithExactly(apiResponseStub, {
					statusCode: 400,
					body: {
						message: sinon.match(/headers/i)
					}
				});
			});

			it('Should return a 400 http error if request authentication data is not an object', async () => {

				const apiResponseStub = sinon.stub(ApiResponse, 'send');

				const { authorizer, ...slsEvent } = { ...sampleServerlessEvent };

				await ServerlessHandler.handle(MyEventListener, {
					...slsEvent,
					authorizer: {
						janisAuth: '[]'
					}
				});

				sinon.assert.calledOnce(apiResponseStub);
				sinon.assert.calledWithExactly(apiResponseStub, {
					statusCode: 400,
					body: {
						message: sinon.match(/authentication data/i)
					}
				});
			});

			it('Should return a 400 http error if http method is not \'post\'', async () => {

				const apiResponseStub = sinon.stub(ApiResponse, 'send');

				const { method, ...slsEvent } = { ...sampleServerlessEvent };

				await ServerlessHandler.handle(MyEventListener, {
					...slsEvent,
					method: 'get'
				});

				sinon.assert.calledOnce(apiResponseStub);
				sinon.assert.calledWithExactly(apiResponseStub, {
					statusCode: 400,
					body: {
						message: sinon.match(/method/i)
					}
				});
			});
		});

		context('Default values and transformations', () => {

			it('Should set the default request headers (empty object) if they are not present', async () => {

				class HeadersEventListener extends EventListener {
					async process() {
						this.setBody({
							headers: this.headers
						});
					}
				}

				const apiResponseStub = sinon.stub(ApiResponse, 'send');

				const { headers, ...slsEvent } = { ...sampleServerlessEvent };

				await ServerlessHandler.handle(HeadersEventListener, slsEvent);

				sinon.assert.calledOnce(apiResponseStub);
				sinon.assert.calledWithExactly(apiResponseStub, sinon.match({
					statusCode: 200,
					body: {
						headers: {}
					}
				}));
			});

			it('Should set the default http method (post) if it\'s not present', async () => {

				class MethodEventListener extends EventListener {
					async process() {
						this.setBody({
							method: this.method
						});
					}
				}

				const apiResponseStub = sinon.stub(ApiResponse, 'send');

				const { method, ...slsEvent } = { ...sampleServerlessEvent };

				await ServerlessHandler.handle(MethodEventListener, slsEvent);

				sinon.assert.calledOnce(apiResponseStub);
				sinon.assert.calledWithExactly(apiResponseStub, sinon.match({
					statusCode: 200,
					body: {
						method: 'post'
					}
				}));
			});
		});

		context('Listener process', () => {

			it('Should not call validate method if it\'s not defined', async () => {

				class NoValidationEventListener {

					constructor() {
						this.response = {};
					}

					setCode(code) {
						this.response.code = code;
						return this;
					}

					async process() {
						this.response.body = {
							foo: 'bar'
						};
					}
				}

				const apiResponseStub = sinon.stub(ApiResponse, 'send');

				await ServerlessHandler.handle(NoValidationEventListener, { ...sampleServerlessEvent });

				sinon.assert.calledOnce(apiResponseStub);
				sinon.assert.calledWithExactly(apiResponseStub, sinon.match({
					statusCode: 200,
					body: {
						foo: 'bar'
					}
				}));
			});

			it('Should return a 400 http error if listener validate throws', async () => {

				class ErrorEventListener extends EventListener {
					async validate() {
						throw new Error('Some process error');
					}
				}

				const apiResponseStub = sinon.stub(ApiResponse, 'send');

				await ServerlessHandler.handle(ErrorEventListener, { ...sampleServerlessEvent });

				sinon.assert.calledOnce(apiResponseStub);
				sinon.assert.calledWithExactly(apiResponseStub, sinon.match({
					statusCode: 400,
					body: {
						message: 'Some process error'
					}
				}));
			});

			it('Should return a custom http error if listener validate sets it and then throws', async () => {

				class ErrorEventListener extends EventListener {
					async validate() {
						this.setCode(404);
						throw new Error('Some process error');
					}
				}

				const apiResponseStub = sinon.stub(ApiResponse, 'send');

				await ServerlessHandler.handle(ErrorEventListener, { ...sampleServerlessEvent });

				sinon.assert.calledOnce(apiResponseStub);
				sinon.assert.calledWithExactly(apiResponseStub, sinon.match({
					statusCode: 404,
					body: {
						message: 'Some process error'
					}
				}));
			});

			it('Should return a 400 http error with default message if listener process throws without message', async () => {

				class ErrorEventListener extends EventListener {
					async validate() {
						throw new Error();
					}
				}

				const apiResponseStub = sinon.stub(ApiResponse, 'send');

				await ServerlessHandler.handle(ErrorEventListener, { ...sampleServerlessEvent });

				sinon.assert.calledOnce(apiResponseStub);
				sinon.assert.calledWithExactly(apiResponseStub, sinon.match({
					statusCode: 400,
					body: {
						message: 'Invalid data'
					}
				}));
			});

			it('Should return a 500 http error if listener process throws', async () => {

				class ErrorEventListener extends EventListener {
					async process() {
						throw new Error('Some process error');
					}
				}

				const apiResponseStub = sinon.stub(ApiResponse, 'send');

				await ServerlessHandler.handle(ErrorEventListener, { ...sampleServerlessEvent });

				sinon.assert.calledOnce(apiResponseStub);
				sinon.assert.calledWithExactly(apiResponseStub, sinon.match({
					statusCode: 500,
					body: {
						message: 'Some process error'
					}
				}));
			});

			it('Should return a custom http error if listener process sets it and then throws', async () => {

				class ErrorEventListener extends EventListener {
					async process() {
						this.setCode(400);
						throw new Error('Some process error');
					}
				}

				const apiResponseStub = sinon.stub(ApiResponse, 'send');

				await ServerlessHandler.handle(ErrorEventListener, { ...sampleServerlessEvent });

				sinon.assert.calledOnce(apiResponseStub);
				sinon.assert.calledWithExactly(apiResponseStub, sinon.match({
					statusCode: 400,
					body: {
						message: 'Some process error'
					}
				}));
			});

			it('Should return a 500 http error with default message if listener process throws without message', async () => {

				class ErrorEventListener extends EventListener {
					async process() {
						throw new Error();
					}
				}

				const apiResponseStub = sinon.stub(ApiResponse, 'send');

				await ServerlessHandler.handle(ErrorEventListener, { ...sampleServerlessEvent });

				sinon.assert.calledOnce(apiResponseStub);
				sinon.assert.calledWithExactly(apiResponseStub, sinon.match({
					statusCode: 500,
					body: {
						message: 'Internal server error'
					}
				}));
			});

			it('Should validate and process the event listener if no errors occur', async () => {

				const apiResponseStub = sinon.stub(ApiResponse, 'send');

				await ServerlessHandler.handle(MyEventListener, { ...sampleServerlessEvent });

				sinon.assert.calledOnce(apiResponseStub);
				sinon.assert.calledWithExactly(apiResponseStub, sinon.match({
					statusCode: 200,
					body: { ...sampleEvent }
				}));
			});

			it('Should set the api session if no errors occur', async () => {

				class SessionEventListener extends EventListener {
					async process() {
						this.setBody({
							session: this.session
						});
					}
				}

				const apiResponseStub = sinon.stub(ApiResponse, 'send');

				await ServerlessHandler.handle(SessionEventListener, { ...sampleServerlessEvent });

				sinon.assert.calledOnce(apiResponseStub);
				sinon.assert.calledWithExactly(apiResponseStub, sinon.match({
					statusCode: 200,
					body: {
						session: {
							authenticationData: {
								clientCode: 'fizzmod'
							}
						}
					}
				}));
			});
		});
	});

});
