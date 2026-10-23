import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export const POST = async (req: Request) => {
  try {
    const { token, role } = await req.json()

    if (!token || !role) {
      return NextResponse.json(
        { message: "missing token or role" },
        { status: 400 }
      )
    }

    const cookiesStore = await cookies()

    cookiesStore.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    })

    cookiesStore.set("role", role, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    })

    return NextResponse.json({
      message: "cookies set successfully!",
    })
  } catch (err) {
    console.log("cookiee error", err)

    return NextResponse.json(
      { message: "Server error while setting cookies" },
      { status: 500 }
    )
  }
}