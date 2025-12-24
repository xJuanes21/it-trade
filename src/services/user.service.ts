import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export interface CreateUserData {
  name: string
  email: string
  password: string
}

export interface User {
  id: string
  name: string | null
  email: string
  createdAt: Date
  updatedAt: Date
}

/**
 * Creates a new user with hashed password
 */
export async function createUser(data: CreateUserData): Promise<User> {
  const { name, email, password } = data

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  })

  if (existingUser) {
    throw new Error("El email ya está en uso")
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 10)

  // Create user
  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
    },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  return user
}

/**
 * Gets a user by email
 */
export async function getUserByEmail(email: string) {
  return await prisma.user.findUnique({
    where: { email },
  })
}

/**
 * Gets a user by ID
 */
export async function getUserById(id: string) {
  return await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      updatedAt: true,
    },
  })
}

/**
 * Verifies a password against a hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash)
}
