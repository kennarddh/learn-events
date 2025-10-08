import { CelosiaResponse, DI, DependencyScope, Injectable, Service } from '@celosiajs/core'

import EventRepository from 'Repositories/EventRepository'
import UnitOfWork from 'Repositories/UnitOfWork/UnitOfWork'

@Injectable(DependencyScope.Singleton)
class EventService extends Service {
	private listeners: Map<string, CelosiaResponse> = new Map<string, CelosiaResponse>()

	constructor(private unitOfWork = DI.get(UnitOfWork)) {
		super('EventService')
	}

	async registerListener(response: CelosiaResponse, lastReceivedMessageId?: bigint) {
		const id = crypto.randomUUID()

		this.listeners.set(id, response)

		if (lastReceivedMessageId !== undefined) {
			const events = await this.unitOfWork.execute(async transaction => {
				return await transaction.getRepository(EventRepository).findMany({
					filter: { id: { gt: lastReceivedMessageId } },
				})
			})

			events.forEach(event => {
				response.write(
					`data: ${JSON.stringify({ id: event.id.toString(), payload: event.payload, createdAt: event.createdAt.getTime() })}\n\n`,
				)
			})
		}

		return id
	}

	removeListener(id: string) {
		if (!this.listeners.has(id)) return false

		this.listeners.delete(id)

		return true
	}

	async sendBroadcast(payload: string) {
		const event = await this.unitOfWork.execute(async transaction => {
			return await transaction.getRepository(EventRepository).create({ data: { payload } })
		})

		this.listeners.forEach(listener => {
			listener.write(
				`data: ${JSON.stringify({ id: event.id.toString(), payload: event.payload, createdAt: event.createdAt.getTime() })}\n\n`,
			)
		})
	}
}

export default EventService
