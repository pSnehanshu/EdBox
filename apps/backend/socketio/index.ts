import { Server } from "socket.io";
import { Server as HTTPServer } from "http";
import prisma from "../prisma";
import { isPast } from "date-fns";
import {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
} from "schooltalk-shared/types";
import { GroupActivities$ } from "../groups/GroupActivity";

const GroupIdSchoolIdMap = new Map<string, string>();

/** Get school id from group id */
async function getSchoolIdFromGroupId(groupId: string): Promise<string | null> {
  if (GroupIdSchoolIdMap.has(groupId)) {
    return GroupIdSchoolIdMap.get(groupId) ?? null;
  }

  const group = await prisma.group.findUnique({
    where: { id: groupId },
    select: { school_id: true },
  });

  const schoolId = group?.school_id ?? null;

  // Set in cache
  if (schoolId) GroupIdSchoolIdMap.set(groupId, schoolId);

  return schoolId;
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

      socket.on("joinGroupRoom", async (groupId) => {
        // Ensure user is member of GroupId
        const group = await prisma.group.findUniqueOrThrow({
          where: { id: groupId },
          include: {
            Members: {
              where: {
                user_id: user.id,
              },
            },
          },
        });

        const membership = group.Members.find(
          (member) => member.user_id === user.id,
        );

        if (!membership) {
          throw new Error(
            `User ${user.id} is not a member of group ${group.id}`,
          );
        }

        // Join user to group
        socket.join(group.id);
      });
    });

  // Tie up with Activity Observable
  GroupActivities$.subscribe(async (activity) => {
    const schoolId = await getSchoolIdFromGroupId(activity.group_id);

    if (schoolId) {
      io.of(`/${schoolId}`).to(activity.group_id).emit("newActivity", activity);
    }
  });
}
