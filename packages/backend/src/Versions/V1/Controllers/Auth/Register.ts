import {
	CelosiaResponse,
	Controller,
	ControllerRequest,
	DependencyInjection,
	EmptyObject,
} from '@celosiajs/core'

import { ApiErrorKind, ApiErrorResource } from '@learn-events/common'
import { z } from 'zod/v4'

import AuthService from 'Services/AuthService'

import { InvalidStateError } from 'Errors'

class Register extends Controller {
	constructor(private authService = DependencyInjection.get(AuthService)) {
		super('AuthRegister')
	}

	public async index(
		_: EmptyObject,
		request: ControllerRequest<Register>,
		response: CelosiaResponse,
	) {
		const { username, name, password } = request.body

		try {
			const user = await this.authService.register(username, name, password)

			return response.status(201).json({
				errors: {},
				data: {
					id: user.id.toString(),
				},
			})
		} catch (error) {
			if (
				error instanceof InvalidStateError &&
				error.operation === 'register' &&
				error.state === 'userAlreadyExists'
			) {
				return response.status(401).json({
					errors: {
						others: [
							{
								resource: ApiErrorResource.Username,
								kind: ApiErrorKind.Taken,
							},
						],
					},
					data: {},
				})
			}

			this.logger.error('Other.', error)

			return response.sendInternalServerError()
		}
	}

	public override get body() {
		return z.object({
			name: z.string().trim().min(1).max(100),
			username: z
				.string()
				.trim()
				.min(1)
				.max(50)
				.regex(/^(?!.*\s)/g, 'Must not contains white space.'),
			password: z
				.string()
				.min(8)
				.max(100)
				.regex(/^(?!.*\s)/g, 'Must not contains white space.'),
		})
	}
}

export default Register
