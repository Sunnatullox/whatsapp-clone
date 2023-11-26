import express from "express";
import { config } from "dotenv";
import cors from "cors";
import { Server } from "socket.io";
import morgan from 'morgan'

// import module
import { error } from "./middlewares/error.js";
import AuthRouter from "./routes/AuthRoutes.js";
import MessageRouter from "./routes/MessageRoutes.js";
config();

const app = express();

app.use(express.json());
app.use(morgan("dev"))
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);
app.use("/upload/images", express.static("upload/images"));
app.use("/upload/recordings", express.static("upload/recordings"));

// routers
app.use("/api/auth", AuthRouter);
app.use("/api/messages", MessageRouter);

// error handling
app.use(error);

// Handling uncaught Exception
process.on("uncaughtException", (err) => {
  console.log(`Error: ${err.message}`);
});

// Serverni boshqarish uchun server o'zgaruvchisini tanlang
const server = app.listen(process.env.PORT || 5000, () => {
  console.log(
    `Server listening on port: http://localhost:${server.address().port}`
  );
});

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
  },
});
global.onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log("user connect: " + socket.id);
  global.chatSocket = socket;

  socket.on("add-user", (userId) => {
    onlineUsers.set(userId, socket.id);
    socket.broadcast.emit("online-users", {
      onlineUsers: Array.from(onlineUsers.keys()),
    })
  });


  socket.on("signout", (id) => {
    onlineUsers.delete(id)
    socket.broadcast.emit("online-users", {
      onlineUsers: Array.from(onlineUsers.keys()),
    })
  })

  socket.on("send-msg", (data) => {
    const sendUserSocket = onlineUsers.get(data.to);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("msg-recieve", {
        from: data.from,
        message: data.message,
      });
    }
  });

  socket.on("outgoing-voice-call", (data) => {
    const sendUserSocket = onlineUsers.get(data.to);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("incoming-voice-call", {
        from: data.from,
        roomId: data.roomId,
        callType: data.callType,
      });
    }
  });
  socket.on("outgoing-video-call", (data) => {
    const sendUserSocket = onlineUsers.get(data.to);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("incoming-video-call", {
        from: data.from,
        roomId: data.roomId,
        callType: data.callType,
      });
    }
  });

socket.on("reject-voice-call",data => {
  const sendUserSocket = onlineUsers.get(data.from);
  if(sendUserSocket){
    socket.to(sendUserSocket).emit("voice-call-rejected")
  }
})
socket.on("reject-video-call",data => {
  const sendUserSocket = onlineUsers.get(data.from);
  if(sendUserSocket){
    socket.to(sendUserSocket).emit("video-call-rejected")
  }
})

socket.on("eccept-incoming-call", ({id}) => {
  const sendUserSocket = onlineUsers.get(id)
  socket.to(sendUserSocket).emit("accept-call")
})

socket.on("disconnect", async() => {
  
  let valueToDelete = null;

  onlineUsers.forEach((value, key) => {
  if (value === socket.id) { // O'chirishni istagan value ni yozing
    valueToDelete = key;
  }
});

if (valueToDelete !== null) {
  onlineUsers.delete(valueToDelete);
  console.log(`user disconnected: ${valueToDelete}`);
  socket.broadcast.emit("online-users", {
    onlineUsers: Array.from(onlineUsers.keys()),
  })
} else {
  console.log('Bunday qiymat topilmadi');
}
})

});

// unhandled promise rejection
process.on("unhandledRejection", (err) => {
  console.log(`Shutting down the server for ${err.message}`);
  // Serverni yopamiz
  server.close(() => {
    process.exit(1);
  });
});
