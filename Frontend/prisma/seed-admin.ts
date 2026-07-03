import 'dotenv/config'
import { randomUUID } from 'crypto'
import { hashPassword } from 'better-auth/crypto'
import { prisma } from '../lib/prisma'

async function main() {
  const username = 'admin'
  const password = 'LinkingOverseas@2026'

  const existing = await prisma.user.findUnique({ where: { username } })
  if (existing) {
    console.log('Admin user already exists:', existing.id)
    return
  }

  const userId = randomUUID()
  const hashed = await hashPassword(password)

  await prisma.user.create({
    data: {
      id: userId,
      name: 'Admin',
      email: 'admin@linkingoverseas.com',
      emailVerified: true,
      username,
      displayUsername: 'admin',
      role: 'admin',
      accounts: {
        create: {
          id: randomUUID(),
          accountId: userId,
          providerId: 'credential',
          password: hashed,
        },
      },
    },
  })

  console.log('Admin user created.')
  console.log('username:', username)
  console.log('password:', password)
}

main().catch((e) => { console.error(e); process.exitCode = 1 }).finally(() => prisma.$disconnect())
