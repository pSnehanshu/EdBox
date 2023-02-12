import { PrismaClient } from "@prisma/client";

// To log the SQL queries, try https://github.com/prisma/prisma/issues/5026#issuecomment-759596097

const prisma = new PrismaClient();

export default prisma;
