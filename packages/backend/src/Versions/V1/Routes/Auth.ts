import { CelosiaRouter } from '@celosiajs/core'

import VerifyJWT from 'Middlewares/VerifyJWT'

import { Login, Me, Refresh, Register } from 'Versions/V1/Controllers/Auth'

const AuthRouter = new CelosiaRouter({ strict: true })

AuthRouter.post('/login', [], new Login())
AuthRouter.post('/register', [], new Register())
AuthRouter.post('/refresh', [], new Refresh())
AuthRouter.get('/me', [new VerifyJWT(false)], new Me())

export default AuthRouter
