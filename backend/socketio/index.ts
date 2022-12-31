import { Server } from "socket.io";
import { Server as HTTPServer } from "http";
import prisma from "../prisma";
import { isPast } from "date-fns";
import { School, User } from "@prisma/client";

interface ServerToClientEvents {}

interface ClientToServerEvents {}

interface InterServerEvents {}

interface SocketData {
  user: User;
  school: School;
}

export default function initSocketIo(server: HTTPServer) {
  const io = new Server<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >(server);

  io.of(async (name, data, next) => {
    // Remove the first "/" to get the school id
    const schoolId = name.slice(1);

    // Make sure school exists and is active
    const school = await prisma.school.findUnique({
      where: { id: schoolId },
      select: {
        id: true,
        is_active: true,
      },
    });

    const ok = !!(school && school.is_active);

    next(ok ? null : new Error("School not found"), ok);
  })
    .use(async (socket, next) => {
      const schoolId = socket.nsp.name.slice(1);

      const token = socket.handshake.auth.token as string;
      if (!token) {
        return next(new Error("Token necessary"));
      }

      // Fetch session
      const session = await prisma.loginSession.findUnique({
        where: { id: token },
        include: {
          User: {
            include: {
              School: true,
            },
          },
        },
      });

      if (!session) {
        return next(new Error("Invalid token"));
      }

      if (isPast(session.expiry_date)) {
        await prisma.loginSession.delete({
          where: { id: token },
        });
        return next(new Error("Token expired"));
      }

      if (session.User.school_id !== schoolId) {
        return next(new Error("Can not connect to this school"));
      }

      // Attach the user and school
      socket.data.user = session.User;
      socket.data.school = session.User.School;

      next();
    })
    .on("connection", (socket) => {
      const schoolNsp = socket.nsp;

      const user = socket.data.user!;
      const school = socket.data.school!;
    });
}
