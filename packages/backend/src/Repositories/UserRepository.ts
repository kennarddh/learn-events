import { UnpackArray } from 'Types/Types'

import { Prisma } from 'PrismaGenerated/client'

import { DataAccessError, InvalidStateError, ResourceNotFoundError } from '../Errors'
import PrismaRepository from './PrismaRepository'
import { PaginationOptions } from './Types'

export interface UserQueryOptions {
	select?: Prisma.UserSelect
}

export interface UserQueryUniqueOptions extends UserQueryOptions {
	filter: Prisma.UserWhereUniqueInput
}

export interface UserQueryAllOptions extends UserQueryOptions {
	filter?: Prisma.UserWhereInput
	sort?: Prisma.UserOrderByWithRelationInput | Prisma.UserOrderByWithRelationInput[]
	pagination?: PaginationOptions
}

export interface UserCountOptions {
	filter?: Prisma.UserWhereInput
	sort?: Prisma.UserOrderByWithRelationInput | Prisma.UserOrderByWithRelationInput[]
}

export interface UserUpdateOptions {
	filter: Prisma.UserWhereUniqueInput
	data: Prisma.UserUpdateArgs['data']
}

export interface UserCreateOptions extends UserQueryOptions {
	data: Prisma.UserCreateArgs['data']
}

class UserRepository extends PrismaRepository {
	constructor(prisma: Prisma.TransactionClient) {
		super('UserRepositorcy', prisma)
	}

	async findUnique<T = unknown>(options: UserQueryUniqueOptions) {
		try {
			const result = await this.prisma.user.findUnique({
				where: options.filter,
				...(options.select !== undefined ? { select: options.select } : {}),
			})

			return result as (typeof result & T) | null
		} catch (error) {
			this.logger.error('Find unique.', error)

			throw new DataAccessError()
		}
	}

	async findMany<T = unknown>(options: UserQueryAllOptions = {}) {
		const pagination = this.buildPrismaPagination(options.pagination)

		try {
			const result = await this.prisma.user.findMany({
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

	async count(options: UserCountOptions): Promise<number> {
		try {
			return await this.prisma.user.count({
				...(options.filter !== undefined ? { where: options.filter } : {}),
				...(options.sort !== undefined ? { orderBy: options.sort } : {}),
			})
		} catch (error) {
			this.logger.error('Count.', error)

			throw new DataAccessError()
		}
	}

	async create(options: UserCreateOptions) {
		try {
			return await this.prisma.user.create({
				data: options.data,
				...(options.select !== undefined ? { select: options.select } : {}),
			})
		} catch (error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError) {
				if (error.code === 'P2025') {
					throw new ResourceNotFoundError('UserGroup')
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

	async update(options: UserUpdateOptions) {
		try {
			await this.prisma.user.update({
				data: options.data,
				where: options.filter,
				select: { id: true },
			})
		} catch (error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError) {
				if (
					error.code === 'P2025' &&
					typeof error.meta?.cause === 'string' &&
					error.meta.cause.includes('UserGroup')
				) {
					throw new ResourceNotFoundError('UserGroup')
				} else if (
					error.code === 'P2002' &&
					Array.isArray(error.meta?.target) &&
					error.meta.target[0] === 'email'
				) {
					throw new InvalidStateError('update', 'emailAlreadyExists')
				}
			}

			this.logger.error('Update.', error)

			throw new DataAccessError()
		}
	}
}

export default UserRepository
