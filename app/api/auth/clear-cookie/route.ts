import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export const POST = async () => {
  const cookieStore = await cookies()

  cookieStore.delete("token")
  cookieStore.delete("role")

  return NextResponse.json({
    message: "cookies cleared successfully",
  })
}