import { CelosiaRouter } from '@celosiajs/core'

import AuthRouter from './Auth'
import EventRouter from './Event'
import UserRouter from './User'

const V1Router = new CelosiaRouter({ strict: true })

V1Router.useRouters('/auth', AuthRouter)
V1Router.useRouters('/user', UserRouter)
V1Router.useRouters('/event', EventRouter)

export default V1Router
