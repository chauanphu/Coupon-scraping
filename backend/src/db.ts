import { Coupon, PrismaClient } from '@prisma/client'

export const prisma = new PrismaClient()

export async function addCoupon (coupon: Coupon): Promise<Coupon | null> {
  try {
    return await prisma.coupon.create({ data: coupon })
  } catch (error) {
    console.error(error)
    return null
  }
} 

export async function getManyCoupon (sortOrder: "asc" | "desc" = "asc", page: number = 1, limit: number = 8): Promise<Coupon[] | null> {
  try {
    return await prisma.coupon.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        name: sortOrder
      }
    })
  } catch (error) {
    console.error(error)
    return null
  }
}