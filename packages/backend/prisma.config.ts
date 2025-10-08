// import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'
import type { PrismaConfig } from 'prisma'

const Config = {
	schema: './prisma/',
} satisfies PrismaConfig

export default Config
