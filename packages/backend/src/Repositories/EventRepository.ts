import { Injectable } from '@celosiajs/core'

import { UnpackArray } from 'Types/Types'

import { Prisma } from 'PrismaGenerated/client'

import { DataAccessError, InvalidStateError, ResourceNotFoundError } from '../Errors'
import PrismaRepository from './PrismaRepository'
import { PaginationOptions } from './Types'

export interface EventQueryOptions {
	select?: Prisma.EventSelect
}

export interface EventQueryUniqueOptions extends EventQueryOptions {
	filter: Prisma.EventWhereUniqueInput
}

export interface EventQueryAllOptions extends EventQueryOptions {
	filter?: Prisma.EventWhereInput
	sort?: Prisma.EventOrderByWithRelationInput | Prisma.EventOrderByWithRelationInput[]
	pagination?: PaginationOptions
}

export interface EventCountOptions {
	filter?: Prisma.EventWhereInput
	sort?: Prisma.EventOrderByWithRelationInput | Prisma.EventOrderByWithRelationInput[]
}

export interface EventCreateOptions extends EventQueryOptions {
	data: Prisma.EventCreateArgs['data']
}

@Injectable()
class EventRepository extends PrismaRepository {
	constructor(prisma: Prisma.TransactionClient) {
		super('EventRepository', prisma)
	}

	async findUnique<T = unknown>(options: EventQueryUniqueOptions) {
		try {
			const result = await this.prisma.event.findUnique({
				where: options.filter,
				...(options.select !== undefined ? { select: options.select } : {}),
			})

			return result as (typeof result & T) | null
		} catch (error) {
			this.logger.error('Find unique.', error)

			throw new DataAccessError()
		}
	}

	async findMany<T = unknown>(options: EventQueryAllOptions = {}) {
		const pagination = this.buildPrismaPagination(options.pagination)

		try {
			const result = await this.prisma.event.findMany({
				...(options.filter !== undefined ? { where: options.filter } : {}),
				...(options.sort !== undefined ? { orderBy: options.sort } : {}),
				...(options.select !== undefined ? { select: options.select } : {}),
				...(pagination !== undefined ? { skip: pagination.skip } : {}),
				...(pagination !== undefined ? { take: pagination.take } : {}),
			})

			return result as (UnpackArray<typeof result> & T)[]
		} catch (error) {
			this.logger.error('Find many.', error)

			throw new DataAccessError()
		}
	}

	async count(options: EventCountOptions): Promise<number> {
		try {
			return await this.prisma.event.count({
				...(options.filter !== undefined ? { where: options.filter } : {}),
				...(options.sort !== undefined ? { orderBy: options.sort } : {}),
			})
		} catch (error) {
			this.logger.error('Count.', error)

			throw new DataAccessError()
		}
	}

	async create(options: EventCreateOptions) {
		try {
			return await this.prisma.event.create({
				data: options.data,
				...(options.select !== undefined ? { select: options.select } : {}),
			})
		} catch (error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError) {
				if (error.code === 'P2025') {
					throw new ResourceNotFoundError('EventGroup')
				} else if (error.code === 'P2003') {
					throw new ResourceNotFoundError('location')
				} else if (
					error.code === 'P2002' &&
					(error.meta?.target as string[])[0] === 'email'
				) {
					throw new InvalidStateError('create', 'emailAlreadyExists')
				}
			}

			this.logger.error('Create.', error)

			throw new DataAccessError()
		}
	}
}

export default EventRepository
