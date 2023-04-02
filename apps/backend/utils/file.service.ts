import { TRPCError } from "@trpc/server";
import { addSeconds, isPast } from "date-fns";
import crypto from "node:crypto";
import {
  PutObjectCommand,
  HeadObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import prisma from "../prisma";
import CONFIG from "../config";
import { s3client } from "./aws-clients";

export function getFileS3Key(schoolId: string, fileName: string) {
  return `user-uploads/school-${schoolId}/file-${fileName}`;
}

export async function generatePermission(userId: string) {
  // Generate random file name
  const fileName = crypto.randomUUID();

  // Find out school id
  const { school_id } = await prisma.user.findFirstOrThrow({
    where: {
      id: userId,
      School: {
        is_active: true,
      },
    },
    select: { school_id: true },
  });

  // Generate the permission
  return prisma.fileUploadPermission.create({
    data: {
      school_id,
      user_id: userId,
      expiry: addSeconds(new Date(), CONFIG.S3_UPLOAD_URL_EXPIRY_SECONDS),
      s3key: getFileS3Key(school_id, fileName),
    },
  });
}

export async function generateSignedUploadS3URL(userId: string) {
  // Generate permission
  const permission = await generatePermission(userId);

  try {
    const command = new PutObjectCommand({
      Bucket: CONFIG.S3_USERCONTENT_BUCKET,
      Key: permission.s3key,
    });

    // Generate URL
    const signedURL = await getSignedUrl(s3client, command, {
      expiresIn: CONFIG.S3_UPLOAD_URL_EXPIRY_SECONDS,
    });

    return { permission, signedURL };
  } catch (error) {
    // Delete the permission
    await prisma.fileUploadPermission.delete({
      where: { id: permission.id },
    });

    throw error;
  }
}

export async function generateSignedDownloadS3URL(s3key: string) {
  const command = new GetObjectCommand({
    Bucket: CONFIG.S3_USERCONTENT_BUCKET,
    Key: s3key,
  });

  // Generate URL
  const signedURL = await getSignedUrl(s3client, command, {
    expiresIn: CONFIG.S3_DOWNLOAD_URL_EXPIRY_SECONDS,
  });

  return {
    url: signedURL,
    expiry: addSeconds(new Date(), CONFIG.S3_DOWNLOAD_URL_EXPIRY_SECONDS),
  };
}

export async function consumePermission(
  permissionId: string,
  userId: string,
  fileName?: string,
) {
  const permission = await prisma.fileUploadPermission.findUniqueOrThrow({
    where: {
      id: permissionId,
    },
  });

  if (isPast(permission.expiry)) {
    // Delete since expired
    await prisma.fileUploadPermission.delete({
      where: { id: permissionId },
    });

    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Permission expired",
    });
  }

  if (permission.user_id !== userId) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Permission is for another user",
    });
  }

  // Delete since consumed now
  await prisma.fileUploadPermission.delete({
    where: { id: permissionId },
  });

  // Find out school id
  const { school_id } = await prisma.user.findFirstOrThrow({
    where: {
      id: userId,
      School: {
        is_active: true,
      },
    },
    select: { school_id: true },
  });

  // Fetch file metadata
  const headCommand = new HeadObjectCommand({
    Bucket: CONFIG.S3_USERCONTENT_BUCKET,
    Key: permission.s3key,
  });
  const headResponse = await s3client.send(headCommand).catch((err) => {
    console.error(err);
  });

  // Fetch file metadata and populate
  const file = await prisma.uploadedFile.create({
    data: {
      file_name: fileName ?? permission.file_name ?? permission.id,
      s3key: permission.s3key,
      school_id,
      mime: headResponse?.ContentType ?? permission.mime ?? null,
      size_bytes: headResponse?.ContentLength ?? permission.size_bytes ?? null,
      uploader_user_id: userId,
      // TODO: Generate Preview
    },
  });

  // Return the file object
  return file;
}
