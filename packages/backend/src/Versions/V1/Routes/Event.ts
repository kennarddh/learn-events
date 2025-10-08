import { CelosiaRouter } from '@celosiajs/core'

import { Broadcast, Listen } from 'Versions/V1/Controllers/Event'

const AuthRouter = new CelosiaRouter({ strict: true })

AuthRouter.get('/listen', [], new Listen())
AuthRouter.post('/broadcast', [], new Broadcast())

export default AuthRouter
