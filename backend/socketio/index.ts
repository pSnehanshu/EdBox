import { Server } from "socket.io";
import { Server as HTTPServer } from "http";
import prisma from "../prisma";
import { isPast } from "date-fns";
import {
  getCustomGroupIdentifier,
  getGroupIdentifier,
} from "../utils/group-identifier";
import { getAutoGroups } from "../trpc/routers/school/messaging";
import {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
} from "../../shared/types";

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
    .on("connection", async (socket) => {
      const user = socket.data.user!;
      const school = socket.data.school!;

      async function joinGroupRooms() {
        // Join the user to all the group rooms

        const autoGroups = await getAutoGroups(user);

        // Join auto groups
        socket.join(autoGroups.map((g) => g.id));

        const customGroups = await prisma.customGroupMembers.findMany({
          where: {
            user_id: user.id,
            Group: {
              is_active: true,
            },
          },
        });

        // Join custom groups
        socket.join(
          customGroups.map((g) =>
            getCustomGroupIdentifier(school.id, g.group_id)
          )
        );
      }

      await joinGroupRooms();

      socket.on("messageCreate", async (groupIdentifier, text) => {
        const identifier = getGroupIdentifier(groupIdentifier);

        // Save message
        const message = await prisma.message.create({
          data: {
            group_identifier: identifier,
            sender_id: user.id,
            sender_role: "student",
            text,
            school_id: school.id,
          },
        });

        // Broadcast to all clients
        socket.to(identifier).emit("newMessage", message);
      });
    });
}
