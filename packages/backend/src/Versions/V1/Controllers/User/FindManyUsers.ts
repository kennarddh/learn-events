import { CelosiaResponse, Controller, ControllerRequest, DI, EmptyObject } from '@celosiajs/core'

import { SortOrder, UserSortField } from '@learn-events/common'
import z from 'zod/v4'

import RemoveUndefinedValueFromObject from 'Utils/RemoveUndefinedValueFromObject'

import UserService, { UserFindManyOptions } from 'Services/UserService'

import ZodPagination from 'Validations/Zod/ZodPagination'

class FindManyUsers extends Controller {
	constructor(private employeeService = DI.get(UserService)) {
		super('FindManyUsers')
	}

	public async index(
		_: EmptyObject,
		request: ControllerRequest<FindManyUsers>,
		response: CelosiaResponse,
	) {
		const { includeDisabled, search, createdById, groupId, pagination, sort } = request.query

		const options = RemoveUndefinedValueFromObject({
			filter: { includeDisabled, search, createdById, groupId },
			pagination,
			sort,
		}) satisfies UserFindManyOptions

		try {
			const data = await this.employeeService.list(options)

			return response.status(200).json({
				errors: {},
				data,
			})
		} catch (error) {
			this.logger.error('Other.', error)

			return response.sendInternalServerError()
		}
	}

	public override get query() {
		return z.object({
			includeDisabled: z.stringbool().default(false),
			search: z.string().optional(),
			createdById: z.coerce.bigint().min(1n).optional(),
			groupId: z.coerce.bigint().min(1n).optional(),
			pagination: ZodPagination.optional(),
			sort: z
				.object({
					field: z.enum(UserSortField),
					order: z.enum(SortOrder).optional(),
				})
				.optional(),
		})
	}
}

export default FindManyUsers
