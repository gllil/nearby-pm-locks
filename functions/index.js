const { onCall, onRequest } = require("firebase-functions/v2/https");
const XMLHttpRequest = require("xhr2");
const fetch = require("node-fetch");
const express = require("express");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const {
  onDocumentCreated,
  onDocumentWritten,
  onDocumentUpdated,
  Change,
} = require("firebase-functions/v2/firestore");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
initializeApp();

const db = getFirestore();

// // Create and deploy your first functions
// // https://firebase.google.com/docs/functions/get-started
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

const getHostawayToken = () => {
  const promise = new Promise((resolve, reject) => {
    const data = `grant_type=client_credentials&client_id=${process.env.HOSTAWAY_ACCOUNT_ID}&client_secret=${process.env.HOSTAWAY_API_KEY}&scope=general`;

    const xhr = new XMLHttpRequest();
    xhr.withCredentials = true;

    // xhr.addEventListener("readystatechange", function () {
    //   if (this.readyState === 4) {
    //     console.log(this.responseText);
    //   }
    // });

    xhr.open("POST", "https://api.hostaway.com/v1/accessTokens");
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhr.setRequestHeader("Cache-control", "no-cache");
    xhr.responseType = "json";
    xhr.onload = () => {
      resolve(xhr.response);
    };
    xhr.send(data);
  });

  return promise;
};

exports.getReservations = onCall(async () => {
  const token = await getHostawayToken();
  const reservations = await fetch("https://api.hostaway.com/v1/reservations", {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token.access_token}`,
    },
  });

  return reservations.json();
});

exports.storeInFirestore = onRequest((req, res) => {
  db.collection("bookings")
    .doc(JSON.stringify(req.body.id))
    .set(req.body, { merge: true })
    .then(() => {
      res.status(200).send("Booking Updated");
    })
    .catch((err) => res.send(err));
});

exports.updatesToSeam = onDocumentUpdated("bookings/{bookingId}", (event) => {
  const newValue = event.data.after.data();
  const oldValue = event.data.before.data();

  if (
    newValue.arrivalDate !== oldValue.arrivalDate ||
    newValue.departureDate !== oldValue.departureDate ||
    newValue.doorCode !== oldValue.doorCode
  ) {
    fetch("https://connect.getseam.com/access_codes/update", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.SEAM_API_KEY}`,
      },
      body: JSON.stringify({
        access_code_id: newValue.seam.access_code_id,
        name: newValue.guestName,
        starts_at: `${newValue.arrivalDate}T15:45:00-04:00`,
        ends_at: `${newValue.departureDate}T10:30:00-04:00`,
        code: newValue.doorCode,
      }),
    })
      .then((res) => {
        res.json();
      })
      .then((response) => {
        console.log(JSON.stringify(response));
        return;
      })
      .catch((err) => console.log(err));
  }
  if (newValue.status !== oldValue.status && newValue.status === "cancelled") {
    fetch("https://connect.getseam.com/access_codes/delete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.SEAM_API_KEY}`,
      },
      body: JSON.stringify({
        access_code_id: oldValue.seam.access_code_id,
      }),
    })
      .then((res) => {
        res.json();
      })
      .then((response) => {
        console.log(JSON.stringify(response));
        return JSON.stringify(response);
      })
      .catch((err) => {
        console.log(err);
        return err;
      });
  }
});

exports.addToSeam = onDocumentCreated("bookings/{bookingId}", async (event) => {
  const snapshot = event.data;
  if (!snapshot) {
    console.log("No data associated with the event");
    return;
  }
  const data = snapshot.data();
  if (data.status !== "new") {
    console.log("The reservation created is not booked");
    return;
  }

  db.collection("listings")
    .doc(JSON.stringify(data?.listingMapId))
    .get()
    .then((doc) => {
      console.log(JSON.stringify(doc.data()));
      const listing = doc.data();
      if (!doc.exists()) {
        console.log("Document was not found");
        return;
      }

      fetch("https://connect.getseam.com/access_codes/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.SEAM_API_KEY}`,
        },
        body: JSON.stringify({
          // device_id: `${process.env.DEVICE_ID}`,
          device_id: listing.deviceId,
          name: data.guestName,
          starts_at: `${data.arrivalDate}T15:45:00-04:00`,
          ends_at: `${data.departureDate}T10:30:00-04:00`,
          code: data.doorCode,
          sync: true,
        }),
      })
        .then((res) => {
          return res.json();
        })
        .then(async (response) => {
          console.log(JSON.stringify(response));
          db.collection("bookings")
            .doc(JSON.stringify(data.id))
            .set({ seam: response.access_code }, { merge: true })
            .then(() => {
              return JSON.stringify(response);
            })
            .catch((err) => {
              console.log(err);
              return;
            });
        })
        .catch((err) => {
          console.log(err);
          return;
        });
    });
});

exports.sendToSeam = onCall((request) => {
  fetch("https://connect.getseam.com/access_codes/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.SEAM_API_KEY}`,
    },
    body: JSON.stringify({
      device_id: `${process.env.DEVICE_ID}`,
      name: request.data?.guestName,
      starts_at: `${request.data.arrivalDate}T15:45:00-04:00`,
      ends_at: `${request.data.departureDate}T10:30:00-04:00`,
      code: request.data.doorCode,
      sync: true,
    }),
  })
    .then((res) => {
      return res.json();
    })
    .then((response) => {
      console.log(JSON.stringify(response));
      return request.rawRequest.res
        .status(200)
        .json("Successfully added Door code");
    })
    .catch((err) => {
      console.log(err);

      return request.rawRequest.res.status(err.status).json(err.message);
    });
});

app.post((req, res) => {
  if (
    req.body.data?.listingMapId === 149251 &&
    req.body.object === "reservation" &&
    req.body.event === "reservation.created"
  ) {
    fetch("https://connect.getseam.com/access_codes/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.SEAM_API_KEY}`,
      },
      body: JSON.stringify({
        device_id: `${process.env.DEVICE_ID}`,
        name: req.data.guestName,
        starts_at: `${req.data.arrivalDate}T15:45:00-04:00`,
        ends_at: `${req.data.departureDate}T10:30:00-04:00`,
        code: req.data.doorCode,
        sync: true,
      }),
    })
      .then((response) => {
        res.json(response);
      })
      .then((result) => {
        console.log(JSON.stringify(result));
        res.send("Successfully added access code");
      })
      .catch((err) => console.log(err));
  }
  if (req.body.object === "conversationMessage") {
    return;
  }
});

exports.seamWebHook = onRequest(app);
// exports.seamWebHook = onRequest((req, res) => {
//   console.log(JSON.stringify(req.body));
//   if (
//     req.body?.data?.listingMapId === 149251 &&
//     req.body?.object === "reservation" &&
//     req.body?.event === "reservation.created"
//   ) {
//     fetch("https://connect.getseam.com/access_codes/create", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${process.env.SEAM_API_KEY}`,
//       },
//       body: JSON.stringify({
//         device_id: `${process.env.DEVICE_ID}`,
//         name: req.data?.guestName,
//         starts_at: `${req.data.arrivalDate}T15:45:00-04:00`,
//         ends_at: `${req.data.departureDate}T10:30:00-04:00`,
//         code: req.data.doorCode,
//         sync: true,
//       }),
//     })
//       .then((response) => {
//         return response.json();
//       })
//       .then((result) => {
//         console.log(JSON.stringify(result));
//         res.status(200).send("Successfully added access code");
//       });
//   }
//   if (req.body.object === "conversationMessage") {
//     return;
//   }
// });
