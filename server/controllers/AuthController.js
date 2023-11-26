import ErrorHandler from "../middlewares/ErrorHandler.js";
import asyncHandler from "express-async-handler";
import { PrismaClient } from "@prisma/client";
import { generateToken04 } from "../utils/TokenGenerator.js";

const prisma = new PrismaClient();

export const loginUserforGoogle = asyncHandler(async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return next(new ErrorHandler("Email is required", 400));
    }
    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      return res.json({ msg: "user not found", status: false });
    } else {
      return res.json({ msg: "User Found", status: true, data: user });
    }
  } catch (error) {
    next(new ErrorHandler("Error from login", 500));
  }
});

export const onBoardUser = asyncHandler(async (req, res, next) => {
  try {
    const { email, name, about, image: profilePicture } = req.body;
    if (!email || !name || !profilePicture) {
      return next(
        new ErrorHandler("Email, Name, and Image are required.", 400)
      );
    }
    const user = await prisma.user.findFirst({
      where: { email },
    });

    if (user) {
      return next(new ErrorHandler("Email already in use.", 400));
    }
    await prisma.user.create({
      data: {
        email,
        name,
        about,
        profilePicture,
      },
    });
    return res.json({ msg: "Success", status: true });
  } catch (error) {
    console.log(error);
    next(new ErrorHandler("Error from onBoarding", 500));
  }
});

export const getAllUsers = asyncHandler(async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        email: true,
        name: true,
        profilePicture: true,
        about: true,
      },
    });
    const usersGroupByInitialLetter = {};

    users.forEach((user) => {
      const initialLetter = user.name.charAt(0).toUpperCase();
      if (!usersGroupByInitialLetter[initialLetter]) {
        usersGroupByInitialLetter[initialLetter] = [];
      }
      usersGroupByInitialLetter[initialLetter].push(user);
    });

    return res.status(200).send({ users: usersGroupByInitialLetter });
  } catch (error) {
    console.log(error);
    next(new ErrorHandler("Error from get All users", 500));
  }
});

export const generateToken = asyncHandler(async (req, res, next) => {
  try {
    const appId = parseInt(process.env.ZEGO_APP_ID);
    const serverSecret = process.env.ZEGO_SERVER_ID;
    const userId = req.params.userId;
    const effectiveTime = 3600;
    const payload = "";
    if (appId && serverSecret && userId) {
      const token = await generateToken04(
        appId,
        userId,
        serverSecret,
        effectiveTime,
        payload
      );
      return res.status(200).json({ token });
    } else {
      return next(new ErrorHandler("Invalid Parameters", 400));
    }
  } catch (error) {
    next(new ErrorHandler("GenerateToken for Error", 500));
  }
});
