import { Expo, ExpoPushMessage, ExpoPushSuccessTicket } from "expo-server-sdk";
import { cargoQueue, queue } from "async";
import prisma from "../prisma";

const expo = new Expo();

/**
 * This queue sends push notifications to Expo servers
 */
export const pushNotificationQueue = cargoQueue<ExpoPushMessage>(
  async function (messages) {
    try {
      const ticketChunk = await expo.sendPushNotificationsAsync(messages);

      // Process the tickets
      ticketChunk.forEach((ticket, i) => {
        if (ticket.status === "ok") {
          const message = messages.at(i);

          // Check receipt after 30 mins
          if (message) {
            setTimeout(() => {
              pushReceiptQueue.push({ ticket, message });
            }, 30 * 60 * 1000);
          }
        } else {
          if (ticket.details?.error === "DeviceNotRegistered") {
            // Delete device
            const expoPushTokens = messages.at(i)?.to ?? [];
            deleteUnregisteredDevicesQueue.push(expoPushTokens);
          }
        }
      });
    } catch (error) {
      console.error(error);
    }
  },
  1,
  300,
);

/**
 * This queue checks receipts
 */
export const pushReceiptQueue = cargoQueue<{
  ticket: ExpoPushSuccessTicket;
  message?: ExpoPushMessage;
}>(
  async function (data) {
    try {
      const receipts = await expo.getPushNotificationReceiptsAsync(
        data.map((d) => d.ticket.id),
      );

      // The receipts specify whether Apple or Google successfully received the
      // notification and information about an error, if one occurred.
      for (const receiptId in receipts) {
        const receipt = receipts[receiptId];
        const message = data.find((d) => d.ticket.id === receiptId)?.message;
        const expoPushTokens = message?.to ?? [];

        if (receipt.status === "error") {
          // Handle errors
          if (receipt.details?.error) {
            switch (receipt.details.error) {
              case "DeviceNotRegistered":
                deleteUnregisteredDevicesQueue.push(expoPushTokens);
                break;
              case "MessageRateExceeded":
                // Resend after a while
                if (message) {
                  setTimeout(() => {
                    pushNotificationQueue.push(message);
                  }, 60 * 1000);
                }
                break;
              default:
                console.error(
                  `Push notification error occured: ${receipt.details.error}`,
                );
            }
          }
        }
      }
    } catch (error) {
      console.error(error);
    }
  },
  2,
  300,
);

/**
 * This queue deletes push tokens from DB
 */
export const deleteUnregisteredDevicesQueue = queue<string>(
  async (expoPushToken) => {
    await prisma.pushToken.deleteMany({
      where: {
        token: expoPushToken,
      },
    });
  },
  1000,
);
