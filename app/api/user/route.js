import { NextResponse } from "next/server";
import User from "../models/User";
import bcrypt from "bcrypt";

export async function GET(req) {
  // Will need to authorize administrator first

  const content = await User.find();
  return NextResponse.json(
    {
      200: {
        content,
      },
    }
  );
}

export async function POST(req) {
  // This may or may not require admin authorization
  // For now, anybody can make account

  const body = await req.json();
  if (!(body.username && body.password)) {
    return NextResponse.json(
      {
        400: {
          message: "Please provide a username and password",
        },
      },
      {
        status: 400,
      }
    );
  }

  let userRcvd = {
    username: body.username,
    passwordHash: await bcrypt.hash(body.password, 10),
  };
  // Default role only
  // An admin will have to add role through PUT

  const user = new User(userRcvd);
  let content = await user.save();
  return NextResponse.json(
    {
      201: {
        content,
      },
    },
    {
      status: 201,
    }
  );
}
