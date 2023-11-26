import asyncHandler from "express-async-handler";
import ErrorHandler from "../middlewares/ErrorHandler.js";
import { PrismaClient } from "@prisma/client";
import { renameSync } from "fs";

const prisma = new PrismaClient();

export const addMessage = asyncHandler(async (req, res, next) => {
  try {
    const { message, from, to } = req.body;
    const getUser = onlineUsers.get(to);
    if (message && from && to) {
      const newMesage = await prisma.messages.create({
        data: {
          message,
          sender: { connect: { id: parseInt(from) } },
          receiver: { connect: { id: parseInt(to) } },
          messageStatus: getUser ? "delivered" : "sent",
        },
        include: { sender: true, receiver: true },
      });
      return res.status(201).json({ message: newMesage });
    }
    return res.status(400).send("From to and Message is required");
  } catch (error) {
    console.log(error);
    next(new ErrorHandler("Could not add message", 500));
  }
});

export const getMessages = asyncHandler(async (req, res, next) => {
  try {
    const { from, to } = req.params;

    const messages = await prisma.messages.findMany({
      where: {
        OR: [
          {
            senderId: parseInt(from),
            receiverId: parseInt(to),
          },
          {
            senderId: parseInt(to),
            receiverId: parseInt(from),
          },
        ],
      },
      orderBy: {
        id: "asc",
      },
    });

    const unreadMessages = [];

    messages.forEach((message, i) => {
      if (
        message.messageStatus !== "read" &&
        message.senderId === parseInt(to)
      ) {
        messages[i].messageStatus = "read";
        unreadMessages.push(message.id);
      }
    });

    await prisma.messages.updateMany({
      where: {
        id: { in: unreadMessages },
      },
      data: {
        messageStatus: "read",
      },
    });
    return res.status(200).json({ messages });
  } catch (error) {
    console.log(error);
    next(new ErrorHandler("Get Messages Error", 500));
  }
});

export const addImageMessage = asyncHandler(async (req, res, next) => {
  try {
    const { to, from } = req.query;
    if (req.file) {
      const date = Date.now();
      let fileName = "upload/images/" + date + req.file.originalname;
      renameSync(req.file.path, fileName);
      if ((from, to)) {
        const message = await prisma.messages.create({
          data: {
            message: fileName,
            sender: { connect: { id: parseInt(from) } },
            receiver: { connect: { id: parseInt(to) } },
            type: "image",
          },
        });

        return res.status(201).json({ message });
      } else return res.status(400).send("From, To is required.");
    } else return res.status(400).send("Image is required");
  } catch (error) {
    next(new ErrorHandler("Server error", 500));
  }
});

export const addAudioMessage = asyncHandler(async (req, res, next) => {
  try {
    const { to, from } = req.query;
    if (req.file) {
      const date = Date.now();
      let fileName = "upload/recordings/" + date + req.file.originalname;
      renameSync(req.file.path, fileName);
      if ((from, to)) {
        const message = await prisma.messages.create({
          data: {
            message: fileName,
            sender: { connect: { id: parseInt(from) } },
            receiver: { connect: { id: parseInt(to) } },
            type: "audio",
          },
        });

        return res.status(201).json({ message });
      } else return res.status(400).send("From, To is required.");
    } else return res.status(400).send("Audio is required");
  } catch (error) {
    next(new ErrorHandler("Server error", 500));
  }
});

export const getInitialContactwithMessages = asyncHandler(
  async (req, res, next) => {
    try {
      const userId = parseInt(req.params.from);
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          sentMessages: {
            include: {
              receiver: true,
              sender: true,
            },
            orderBy: {
              createdAt: "desc",
            },
          },
          receiverMessages: {
            include: {
              receiver: true,
              sender: true,
            },
            orderBy: {
              createdAt: "desc",
            },
          },
        },
      });
      const messages = [...user.sentMessages, ...user.receiverMessages];
      messages.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      const users = new Map();
      const messageStatusChange = [];

      messages.forEach((msg) => {
        const isSender = msg.senderId === userId;
        const calculatedId = isSender ? msg.receiverId : msg.senderId;
        if (msg.messageStatus === "sent") {
          messageStatusChange.push(msg.id);
        }
        const {
          id,
          type,
          message,
          messageStatus,
          createdAt,
          senderId,
          receiverId,
        } = msg;
        if (!users.get(calculatedId)) {
          let user = {
            messageId: id,
            type,
            message,
            messageStatus,
            createdAt,
            senderId,
            receiverId,
          };
          if (isSender) {
            user = {
              ...user,
              ...msg.receiver,
              totalUnreadMessages: 0,
            };
          } else {
            user = {
              ...user,
              ...msg.sender,
              totalUnreadMessages: messageStatus !== "read" ? 1 : 0,
            };
          }
          users.set(calculatedId, {
            ...user,
          });
        } else if (msg.messageStatus !== "read" && !isSender) {
          const user = users.get(calculatedId);
          users.set(calculatedId, {
            ...user,
            totalUnreadMessages: user.totalUnreadMessages + 1,
          });
        }
      });

      if (messageStatusChange.length) {
        await prisma.messages.updateMany({
          where: {
            id: { in: messageStatusChange },
          },
          data: {
            messageStatus: "delivered",
          },
        });
      }

      return res.status(200).json({
        users: Array.from(users.values()),
        onlineUsers: Array.from(onlineUsers.keys()),
      });
    } catch (error) {
      next(new ErrorHandler(error, 500));
    }
  }
);
