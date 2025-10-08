import { CelosiaRouter } from '@celosiajs/core'

import VerifyJWT from 'Middlewares/VerifyJWT'

import { FindManyUsers, FindUserById, UpdateUser } from 'Versions/V1/Controllers/User'

const UserRouter = new CelosiaRouter({ strict: true })

UserRouter.get('/', [new VerifyJWT(false)], new FindManyUsers())
UserRouter.patch('/:id', [new VerifyJWT(false)], new UpdateUser())
UserRouter.get('/:id', [new VerifyJWT(false)], new FindUserById())

export default UserRouter
