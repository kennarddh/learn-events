import { CelosiaResponse, Controller, ControllerRequest, DI, EmptyObject } from '@celosiajs/core'

import EventService from 'Services/EventService'

class Listen extends Controller {
	constructor(private eventService = DI.get(EventService)) {
		super('EventListen')
	}

	public async index(
		_: EmptyObject,
		request: ControllerRequest<Listen>,
		response: CelosiaResponse,
	) {
		// Set necessary headers for SSE
		response.header('Content-Type', 'text/event-stream')
		response.header('Cache-Control', 'no-cache')
		response.header('Connection', 'keep-alive')

		response.expressResponse.flushHeaders()

		const listenerId = this.eventService.registerListener(response)

		request.expressRequest.on('close', () => {
			this.eventService.removeListener(listenerId)
		})
	}
}

export default Listen
