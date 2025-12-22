import 'dotenv/config'
import { defineConfig } from 'prisma/config'

export default defineConfig({
  schema: './prisma/schema.prisma',
  datasource: {
    // Used by Prisma CLI (generate/migrate). Runtime URL is provided to the adapter/pg Pool.
    url: process.env.DATABASE_URL,
  },
})
