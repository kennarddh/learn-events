export enum SortOrder {
	Ascending = 'asc',
	Descending = 'desc',
}

export enum UserSortField {
	Name = 'name',
	CreatedAt = 'createdAt',
}

export enum ApiErrorResource {
	Endpoint = 'Endpoint',
	RateLimit = 'RateLimit',
	RefreshToken = 'RefreshToken',
	AccessToken = 'AccessToken',
	User = 'User',
	Username = 'Username',
}

export enum ApiErrorKind {
	NotFound = 'NotFound',
	Unauthorized = 'Unauthorized',
	Disabled = 'Disabled',
	CannotBeDisabled = 'CannotBeDisabled',
	Enabled = 'Enabled',
	Invalid = 'Invalid',
	Exceeded = 'Exceeded',
	Expired = 'Expired',
	Taken = 'Taken',
	CannotBeArray = 'CannotBeArray',
	InternalServerError = 'InternalServerError',
	Duplicate = 'Duplicate',
}

export interface ApiOtherError {
	resource: ApiErrorResource | null
	kind: ApiErrorKind
}
