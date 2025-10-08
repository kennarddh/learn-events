import { ApiErrorKind, ApiOtherError } from '@learn-events/common'
import { FormatParsingError, IsApiResponseError } from 'Api'

const HandleApiError = (
	error: unknown,
	handleOtherOtherError?: (error: ApiOtherError) => string | undefined,
): string => {
	if (IsApiResponseError(error)) {
		if (error.apiErrorResponse.errors.parsing) {
			const formattedParsingErrors = FormatParsingError(error.apiErrorResponse.errors.parsing)

			const formattedParsingError = formattedParsingErrors.join('\n')

			return formattedParsingError
		} else if (error.apiErrorResponse.errors.others) {
			const firstOtherError = error.apiErrorResponse.errors.others[0]

			if (!firstOtherError) {
				console.error('Empty error during api request.', error)

				return 'errors:unknown.text'
			}

			if (
				firstOtherError.resource === null &&
				firstOtherError.kind === ApiErrorKind.Unauthorized
			)
				return 'errors:accessDenied.text'

			if (
				firstOtherError.resource === null &&
				firstOtherError.kind === ApiErrorKind.InternalServerError
			) {
				return 'errors:unknown.text'
			}

			if (handleOtherOtherError) {
				const errorText = handleOtherOtherError(firstOtherError)

				if (errorText !== undefined) return errorText
			}

			console.error('Not handled error during api request.', error)

			return 'errors:unknown.text'
		} else {
			console.error('Unknown api request error occured.', error)

			return 'errors:unknown.text'
		}
	} else {
		return 'errors:network.text'
	}
}

export default HandleApiError
