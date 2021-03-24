"use strict";

// Imports
const { dialogflow, SignIn, Image, Carousel, Suggestions } = require("actions-on-google");
const functions = require("firebase-functions");
const axios = require("axios").default;
const dateFormat = require("dateformat");
const admin = require("firebase-admin");

// Dialogflow setup
const app = dialogflow({
  clientId: "XXXXXXXXXXX",
  // XXXXXXXXXXX = Client ID issued by Google to your Actions
  // Get this clientId from https://console.actions.google.com/u/1/project/ZZZZZZZ/accountlinking/
  // ... where ZZZZZZZ is the name of your project
});
exports.dialogflowFirebaseFulfillment = functions.https.onRequest(app);

// Firestore setup
admin.initializeApp();
const db = admin.firestore();

// Intent handlers:
app.intent("Default Welcome Intent", (conv) => {
  const payload = conv.user.profile.payload;
  if (payload) {
    console.log("**** payload:", payload);
    conv.ask(`Welcome to my agent, ${payload.given_name}! What do you want to do next?`);
  } else {
    conv.ask(new SignIn("hello"));
  }
});

app.intent("Default Fallback Intent", (conv) => {
  conv.ask("I didn't understand");
  conv.ask("I'm sorry, can you try again?");
});

app.intent("Card", (conv) => {
  conv.ask("This message is from Dialogflow's Cloud Functions!");
  conv.ask(new Image({
    url: "https://developers.google.com/assistant/images/badges/XPM_BADGING_GoogleAssistant_VER.png",
    alt: "Alternative text for this picture",
  }))
  conv.ask(new Suggestions("Quick Reply"));
  conv.ask(new Suggestions("Suggestion"));
});

app.intent("Carousel", (conv) => {
  conv.ask("Please choose an item:");
  conv.ask(new Carousel({
    title: "Google Assistant",
    items: {
      "WorksWithGoogleAssistantItemKey": {
        title: "Works With the Google Assistant",
        description: "If you see this logo, you know it will work with the Google Assistant.",
        image: {
          url: "https://developers.google.com/assistant/images/badges/XPM_BADGING_GoogleAssistant_VER.png",
          accessibilityText: "Works With the Google Assistant logo",
        },
      },
      "GoogleHomeItemKey": {
        title: "Google Home",
        description: "Google Home is a powerful speaker and voice Assistant.",
        image: {
          url: "https://lh3.googleusercontent.com/Nu3a6F80WfixUqf_ec_vgXy_c0-0r4VLJRXjVFF_X_CIilEu8B9fT35qyTEj_PEsKw",
          accessibilityText: "Google Home"
        },
      },
    },
  }));
});
  
app.intent("Time", (conv) => {
  return new Promise((resolve, reject) => {
    axios.get("http://worldtimeapi.org/api/timezone/Europe/Madrid")
      .then(function (response) {
        let time = response.data;
        console.log("Time object:", time);
        let currentDateTime = dateFormat(time.currentDateTime, "dd/mmmm/yyyy, h:MM:ss");
        conv.ask("Now its " + currentDateTime);
        return resolve();
      })
      .catch(function (error) {
        conv.ask("Error happened:", error);
        return reject(error);
      });
  });
});

app.intent("Async Time", async (conv) => {
  try {
    let response = await axios.get("http://worldtimeapi.org/api/timezone/Europe/Madrid");
    let time = response.data;
    console.log("Time object (usinc async/await):", time);
    let currentDateTime = dateFormat(time.currentDateTime, "dd/mmmm/yyyy, h:MM:ss");
    conv.ask("Now its " + currentDateTime + " (using async/await)");
  } catch (error) {
    conv.ask("Error happened:", error);
  }
});

app.intent("Add Country", async (conv) => {
  try {
    // Add data (new document with a generated id)
    // https://firebase.google.com/docs/firestore/manage-data/add-data
    let country = {
      country: conv.parameters["geo-country"],
      capital: conv.parameters["geo-capital"]
    };
    let ref = await db.collection("world").add(country);
    let countryId = ref.id;
    conv.ask("Added country " + country.country + " (capital " + country.capital + ")");
    console.log("Added country with id ", countryId, country);
  } catch (error) {
    conv.ask("Error happened:", error);
  }
});

app.intent("List Countries", async (conv) => {
  try {
    // Read data
    // https://firebase.google.com/docs/firestore/query-data/get-data
    conv.ask("List of countries in Firestore");
    let world = await db.collection("world").get();
    console.log("world", world);
    let countries = "";
    world.forEach(doc => {
      countries += `Country: ${doc.data().country}, capital: ${doc.data().capital}\n`;
    });
    conv.ask(countries);
  } catch (error) {
    conv.ask("Error happened:", error);
  }
});

app.intent("Delete Country", async (conv) => {
  try {
    // Delete data
    // https://firebase.google.com/docs/firestore/manage-data/delete-data
    let country = conv.parameters["geo-country"];
    let capital = conv.parameters["geo-capital"];
    let list = await db.collection("world").where("country", "==", country).where("capital", "==", capital).get();
    list.forEach(doc => {
      db.collection("world").doc(doc.id).delete();
      console.log("Deleted country with id", doc.id);
    });
    conv.ask("Deleted country: " + country + " (" + capital + ")");
  } catch (error) {
    conv.ask("Error happened:", error);
  }
});
