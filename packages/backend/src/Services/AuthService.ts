import { DI, Injectable, Service } from '@celosiajs/core'

import UnitOfWork from 'Repositories/UnitOfWork/UnitOfWork'

import ConfigurationService from 'Services/ConfigurationService/ConfigurationService'
import PasswordHashService from 'Services/PasswordHashService'
import AccessTokenService, { AccessTokenJWTPayload } from 'Services/Token/AccessTokenService'
import RefreshTokenService, { RefreshTokenJWTPayload } from 'Services/Token/RefreshTokenService'
import UserService, { User } from 'Services/UserService'

import { ResourceNotFoundError, UnauthorizedError } from 'Errors'

@Injectable()
class AuthService extends Service {
	constructor(
		private unitOfWork = DI.get(UnitOfWork),
		private userService = DI.get(UserService),
		private passwordHashService = DI.get(PasswordHashService),
		private accessTokenService = DI.get(AccessTokenService),
		private refreshTokenService = DI.get(RefreshTokenService),
		private configurationService = DI.get(ConfigurationService),
	) {
		super('AuthService')
	}

	async createTokens(user: User, currentTime: number, expireAt: number) {
		const accessTokenPayload = {
			userId: user.id.toString(),
			iat: currentTime,
		} satisfies AccessTokenJWTPayload

		const accessToken = await this.accessTokenService.sign(accessTokenPayload)

		const refreshTokenPayload = {
			userId: user.id.toString(),
			iat: currentTime,
			exp: expireAt,
		} satisfies RefreshTokenJWTPayload

		const refreshToken = await this.refreshTokenService.sign(refreshTokenPayload)

		return {
			accessToken,
			refreshToken,
		}
	}

	async login(username: string, password: string) {
		return await this.unitOfWork.execute(async () => {
			const user = await this.userService.findByUsername(username)

			if (user === null) throw new UnauthorizedError()

			const isPasswordCorrect = await this.passwordHashService.verify(user.password, password)

			if (!isPasswordCorrect) throw new UnauthorizedError()

			const currentTime = Math.floor(new Date().getTime() / 1000)
			const expireAt =
				currentTime + this.configurationService.configurations.tokens.refresh.expire

			const tokens = await this.createTokens(user, currentTime, expireAt)

			return {
				tokens: {
					accessToken: `Bearer ${tokens.accessToken}`,
					refreshToken: tokens.refreshToken,
				},
				user: {
					id: user.id,
					name: user.name,
					username: user.username,
				},
			}
		})
	}

	async register(username: string, name: string, password: string) {
		return await this.unitOfWork.execute(async () => {
			return await this.userService.create({ name, password, username })
		})
	}

	async refresh(refreshToken: string) {
		const currentRefreshTokenPayload = await this.refreshTokenService.verify(refreshToken)

		return await this.unitOfWork.execute(async () => {
			const user = await this.userService.findById(BigInt(currentRefreshTokenPayload.userId))

			if (user === null) {
				this.logger.error('User not found while refresh.', {
					userId: currentRefreshTokenPayload.userId,
				})

				throw new ResourceNotFoundError('user')
			}

			const currentTime = Math.floor(new Date().getTime() / 1000)
			const expireAt =
				currentTime + this.configurationService.configurations.tokens.refresh.expire

			const tokens = await this.createTokens(user, currentTime, expireAt)

			return {
				accessToken: `Bearer ${tokens.accessToken}`,
				refreshToken: tokens.refreshToken,
			}
		})
	}

	async verifyAccessToken(accessToken: string) {
		const currentAccessTokenPayload = await this.accessTokenService.verify(accessToken)

		return await this.unitOfWork.execute(async () => {
			const user = await this.userService.findById(BigInt(currentAccessTokenPayload.userId))

			if (user === null) {
				this.logger.error('User not found while verify.', {
					userId: currentAccessTokenPayload.userId,
				})

				throw new ResourceNotFoundError('user')
			}

			return user
		})
	}
}

export default AuthService
