import { NextRequest, NextResponse } from "next/server";
import { registerUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const body = await request.json();

  const result = await registerUser(body);

  if (!result.success && result.error) {
    return NextResponse.json(
      {
        message: result.error.message,
        ...(result.error.details && { errors: result.error.details }),
      },
      { status: result.error.status }
    );
  }

  return NextResponse.json(result.data);
}
