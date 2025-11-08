import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";
import { registerApiSchema } from "@/lib/schemas";

interface RegisterData {
  name: string;
  email: string;
  password: string;
}

interface AuthError {
  message: string;
  status: number;
  details?: any[];
}

interface RegisterResult {
  success: boolean;
  data?: any;
  error?: AuthError;
}

export async function registerUser(
  data: RegisterData
): Promise<RegisterResult> {
  try {
    const validationResult = registerApiSchema.safeParse(data);
    if (!validationResult.success) {
      return {
        success: false,
        error: {
          message: "Invalid input data",
          status: 400,
          details: validationResult.error.issues,
        },
      };
    }

    const { email, name, password } = validationResult.data;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return {
        success: false,
        error: {
          message: "User already exists",
          status: 400,
        },
      };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        name,
        hashedPassword,
      },
    });

    const { hashedPassword: _, ...userWithoutPassword } = user;

    return {
      success: true,
      data: userWithoutPassword,
    };
  } catch (error) {
    console.error("REGISTRATION_ERROR", error);
    return {
      success: false,
      error: {
        message: "Internal Server Error",
        status: 500,
      },
    };
  }
}
