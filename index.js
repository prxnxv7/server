const express = require("express");
const webpush = require("web-push");
const bodyParser = require("body-parser");
const path = require("path");
const cors = require("cors");
const azure = require('azure-sb');

const app = express();

// // Configure web-push with your VAPID keys
const VAPID_PUBLIC_KEY =
  "BITStLkGozB9KZ-VMKrIVWzMi6jpLDKrjPEzJ2LUbDSCQm0LSR7yV83N1bzDqfSekG0jJOiKe5f-3HGXA65xFgM";
const VAPID_PRIVATE_KEY = "OtddELVGZpZLGIFiBcyHZKvuIstbJZJjaBppIXTVTZw";

webpush.setVapidDetails(
  "mailto:your-email@example.com",
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

app.use(bodyParser.json());
app.use(cors({ origin: "https://notification-pwa.azurewebsites.net" }));

// Serve the Angular app
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

// // Store subscriptions
const subscriptions = [];

app.post("/api/subscribe", (req, res) => {
  console.log("Subscribing to push notifications");
  const subscription = req.body;
  subscriptions.push(subscription);
  console.log("Subscription is :",subscription);
  res.status(201).json({ message: "Subscription stored" });
});


const port = process.env.PORT || 3000; // Use provided port or default to 3000
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});


// const sendPushNotifications = (res) => {
//   const notificationPayload = {
//     notification: {
//       title: "Push Notification",
//       body: "This is a Timed Push Notification!",
//     },
//   };
//   const subscription = {
//     endpoint:
//       "https://fcm.googleapis.com/fcm/send/d6sM_1h_Yvw:APA91bHSszWdu_B_yRaxCYqwczDu9m6lij9pMTqxWRfYdixGUCHIkZ9myzBwX5IZx3d6Lk86oQEruPgKmErHgV6p8UCXianMqEgJyd_MJWx4nSj5P1W33srELomAciYwQnGN6aquoagl",
//     expirationTime: null,
//     keys: {
//       p256dh:
//         "BPqe8tStncUQ0Sdz2W9TZl8Fj7rXuoyu10hk-kdFreiuenxUhEh8BiBEDgJPyvyffOVPOGQl32mz60UelEAuRCk",
//       auth: "BC8AUfG_wh6eKrjVO_4-TQ",
//     },
//   };
//   webpush
//     .sendNotification(subscription, JSON.stringify(notificationPayload))
//     .then(() => {
//       console.log("Push notification sent successfully to one subscriber.");
//     })
//     .catch((error) => {
//       console.error("Error sending push notification:", error);
//     });
// };

// // let intervalId;

// //for sending to all subscribers

app.post('/api/send-notification', (req, res) => {
  const notificationPayload = {
    notification: {
      title: 'Push Notification',
      body: 'This is a Push Notification from your Angular app!',
    },
    data: {
      // Specify the URL to open when the notification is clicked
      url: "https://notification-pwa.azurewebsites.net", // Replace with your actual website URL
    },
  };

  Promise.all(
    subscriptions.map((subscription) => {
      return webpush.sendNotification(
        subscription,
        JSON.stringify(notificationPayload)
      );
    })
  )
    .then(() => res.status(200).json({ message: 'Push notifications sent' }))
    .catch((error) => {
      console.error('Error sending push notifications:', error);
      res.sendStatus(500);
    });
});



// //for timed notificatioin do the below code

// /*app.post("/api/send-notification", (req, res) => {
//   if (!intervalId) {
//     // Start the interval only if it's not already running
//     intervalId = setInterval(sendPushNotifications, 3 * 1000);
//     res.status(200).json({ message: "Push notifications scheduled" });
//   } else {
//     res
//       .status(400)
//       .json({ message: "Push notifications are already scheduled" });
//   }
// });

// app.post("/api/stop-notification", (req, res) => {
//   if (intervalId) {
//     // Stop the interval if it's running
//     clearInterval(intervalId);
//     intervalId = undefined;
//     res.status(200).json({ message: "Push notifications stopped" });
//   } else {
//     res
//       .status(400)
//       .json({ message: "Push notifications are not currently scheduled" });
//   }
// });*/






