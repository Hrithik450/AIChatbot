import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { UsersService } from "@/actions/users/users.service";
import { signUpSchema } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const validatedFields = signUpSchema.parse(data);

    const { password } = validatedFields;
    const hashedPassword = await bcrypt.hash(password, 10);

    const response = await UsersService.createUser({
      ...validatedFields,
      password: hashedPassword,
    });
    if (!response.success) {
      return NextResponse.json({ error: response.error }, { status: 400 });
    }

    return NextResponse.json(response.data, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const email = searchParams.get("email");

    if (id) {
      const response = await UsersService.getUserById(id);
      if (!response.success) {
        return NextResponse.json({ error: response.error }, { status: 404 });
      }
      return NextResponse.json(response.data);
    }

    if (email) {
      const response = await UsersService.getUserByEmail(email);
      if (!response.success) {
        return NextResponse.json({ error: response.error }, { status: 404 });
      }
      return NextResponse.json(response.data);
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const data = await request.json();
    const response = await UsersService.updateUser(userId, data);

    if (!response.success) {
      return NextResponse.json({ error: response.error }, { status: 404 });
    }

    return NextResponse.json(response.data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const response = await UsersService.deleteUser(userId);

    if (!response.success) {
      return NextResponse.json({ error: response.error }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
