import { CelosiaResponse, DependencyScope, Injectable, Service } from '@celosiajs/core'

@Injectable(DependencyScope.Singleton)
class EventService extends Service {
	private listeners: Map<string, CelosiaResponse> = new Map<string, CelosiaResponse>()

	constructor() {
		super('EventService')
	}

	registerListener(response: CelosiaResponse) {
		const id = crypto.randomUUID()

		this.listeners.set(id, response)

		return id
	}

	removeListener(id: string) {
		if (!this.listeners.has(id)) return false

		this.listeners.delete(id)

		return true
	}

	sendBroadcast(payload: string) {
		this.listeners.forEach(listener => {
			listener.write(`data: ${payload}\n\n`)
		})
	}
}

export default EventService
