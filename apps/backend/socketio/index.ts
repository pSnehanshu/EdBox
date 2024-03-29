import { Server, type Socket } from "socket.io";
import { Server as HTTPServer } from "http";
import prisma from "../prisma";
import { isPast } from "date-fns";
import {
  convertObjectToOrderedQueryString,
  parseGroupIdentifierString,
} from "schooltalk-shared/group-identifier";
import {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
} from "schooltalk-shared/types";
import { getUserGroups } from "../utils/groups";
import { defaultTransformer } from "@trpc/server";
import { consumeMultiplePermissions } from "../utils/file.service";

export default function initSocketIo(server: HTTPServer) {
  const io = new Server<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >(server);

  io.of(async (name, data, next) => {
    // Remove the first "/" to get the school id
    const schoolId = name.split("/").at(-1);

    // Make sure school exists and is active
    const school = await prisma.school
      .findUnique({
        where: { id: schoolId },
        select: {
          id: true,
          is_active: true,
        },
      })
      .catch((err) => {
        console.error(err);
      });

    const ok = !!(school && school.is_active);

    next(ok ? null : new Error("School not found"), ok);
  })
    .use(async (socket, next) => {
      const schoolId = socket.nsp.name.split("/").at(-1);

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
              Staff: true,
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
      const { user, school } = socket.data;
      if (!user || !school) {
        socket.disconnect();
        return;
      }

      const myGroups = await joinGroupRooms(user, socket);

      socket.on(
        "messageCreate",
        async (groupIdentifier, text, filePermissions, callback) => {
          try {
            // Parse the incoming group identifier string, make sure it is valid format
            const identifier = parseGroupIdentifierString(groupIdentifier);

            if (identifier.sc !== school.id) {
              throw new Error("Can't send message to another school");
            }

            // Regenerate identifier string, to make sure it is ordered
            const cleanGroupIdentifier =
              convertObjectToOrderedQueryString(identifier);

            // Check if the user is a member of the auto-group
            if (
              identifier.gd === "a" &&
              !myGroups.includes(cleanGroupIdentifier)
            ) {
              throw new Error("User not member of the given group");
            }

            // TODO: Check membership of custom groups

            // Consume the given files
            const files = await consumeMultiplePermissions(
              filePermissions,
              user.id,
            );

            // Save message
            const message = await prisma.message.create({
              data: {
                group_identifier: cleanGroupIdentifier,
                sender_id: user.id,
                sender_role: "student",
                text,
                school_id: school.id,
                // Consume the files
                Attachments: {
                  createMany: {
                    data: files.map((file) => ({
                      file_id: file.id,
                    })),
                    skipDuplicates: true,
                  },
                },
              },
              include: {
                ParentMessage: true,
                Sender: true,
                Attachments: {
                  include: {
                    File: true,
                  },
                },
              },
            });

            // Must do this, becasue JSON.stringify can't serialize big ints
            message.sort_key = message.sort_key.toString() as any;

            const serializedMessage =
              defaultTransformer.output.serialize(message);

            // Broadcast to all clients
            socket
              .to(cleanGroupIdentifier)
              .emit("newMessage", serializedMessage);

            // Send acknowledgement
            callback(serializedMessage);

            // TODO, send FCM and APN messages
          } catch (error) {
            console.error("Failed to receive message", error);
          }
        },
      );
    });
}

async function joinGroupRooms(user: SocketData["user"], socket: Socket) {
  // Join the user to all the group rooms
  const groups = await getUserGroups(user);
  const groupIds = groups.map((g) => g.identifier);

  // Join  groups
  socket.join(groupIds);

  // Finally get all the group identifiers
  return groupIds;
}
