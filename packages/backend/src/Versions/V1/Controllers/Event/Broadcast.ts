import { CelosiaResponse, Controller, ControllerRequest, DI, EmptyObject } from '@celosiajs/core'

import { z } from 'zod/v4'

import EventService from 'Services/EventService'

class Broadcast extends Controller {
	constructor(private eventService = DI.get(EventService)) {
		super('EventBroadcast')
	}

	public async index(
		_: EmptyObject,
		request: ControllerRequest<Broadcast>,
		response: CelosiaResponse,
	) {
		await this.eventService.sendBroadcast(request.body.payload)

		response.sendStatus(204)
	}

	public override get body() {
		return z.object({
			payload: z.string(),
		})
	}
}

export default Broadcast
