// Fulfillment example developed by UC3M in the context of the Platform for Networked Communities
"use strict";

const functions = require("firebase-functions");
const { WebhookClient } = require("dialogflow-fulfillment");
const { Card, Suggestion } = require("dialogflow-fulfillment");
const { Carousel } = require("actions-on-google");
const axios = require("axios").default;
const dateFormat = require("dateformat");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

process.env.DEBUG = "dialogflow:debug"; // enables lib debugging statements

exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  const agent = new WebhookClient({ request, response });
  console.log("Dialogflow Request headers", request.headers);
  console.log("Dialogflow Request body", request.body);

  function welcome(agent) {
    agent.add("Welcome to PCR-test agent!");
  }

  function fallback(agent) {
    agent.add("I didn't understand");
    agent.add("I'm sorry, can you try again?");
  }

  function cardHandler(agent) {
    agent.add("This message is from Dialogflow's Cloud Functions!");
    agent.add(new Card({
      title: "Title: this is a card title",
      imageUrl: "https://developers.google.com/assistant/images/badges/XPM_BADGING_GoogleAssistant_VER.png",
      text: "This is the body text of a card.",
      buttonText: "This is a button",
      buttonUrl: "https://assistant.google.com/"
    }));
    agent.add(new Suggestion("Quick Reply"));
    agent.add(new Suggestion("Suggestion"));
  }

  function carouselHandler(agent) {
    let conv = agent.conv();
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
    agent.add(conv);
  }

  function timeHandler(agent) {
    return new Promise((resolve, reject) => {
      axios.get("http://worldtimeapi.org/api/timezone/Europe/Madrid")
        .then(function (response) {
          let time = response.data;
          console.log("Time object:", time);
          let currentDateTime = dateFormat(time.currentDateTime, "dd/mmmm/yyyy, h:MM:ss");
          agent.add("Now its " + currentDateTime);
          return resolve();
        })
        .catch(function (error) {
          console.error("Error happened:", error);
          return reject(error);
        });
    });
  }

  async function timeAsyncHandler(agent) {
    try {
      let response = await axios.get("http://worldtimeapi.org/api/timezone/Europe/Madrid");
      let time = response.data;
      console.log("Time object:", time);
      let currentDateTime = dateFormat(time.currentDateTime, "dd/mmmm/yyyy, h:MM:ss");
      agent.add("Now its " + currentDateTime + " (using async/await)");
    } catch (error) {
      console.error("Error happened:", error);
    }
  }

  async function addCountryHandler(agent) {
    try {
      // Add data (new document with a generated id)
      // https://firebase.google.com/docs/firestore/manage-data/add-data
      let country = {
        country: agent.parameters["geo-country"],
        capital: agent.parameters["geo-capital"]
      };
      let ref = await db.collection("world").add(country);
      let countryId = ref.id;
      agent.add("Added country " + country.country + " (capital " + country.capital + ")");
      console.log("Added country with id ", countryId, country);
    } catch (error) {
      console.error("Error happened:", error);
    }
  }

  async function listCountryHandler(agent) {
    try {
      // Read data
      // https://firebase.google.com/docs/firestore/query-data/get-data
      agent.add("List of countries in Firestore");
      let world = await db.collection("world").get();
      world.forEach(doc => {
        agent.add("Country: " + doc.data().country + ", capital: " + doc.data().capital);
      });
    } catch (error) {
      console.error("Error happened:", error);
    }
  }

  async function deleteCountryHandler(agent) {
    try {
      // Delete data
      // https://firebase.google.com/docs/firestore/manage-data/delete-data
      let country = agent.parameters["geo-country"];
      let capital = agent.parameters["geo-capital"];
      let list = await db.collection("world").where("country", "==", country).where("capital", "==", capital).get();
      list.forEach(doc => {
        db.collection("world").doc(doc.id).delete();
        console.log("Deleted country with id", doc.id);
      });
      agent.add("Deleted country: " + country + " (" + capital + ")");
    } catch (error) {
      console.error("Error happened:", error);
    }
  }

  // Function handler based on the matched Dialogflow intent name
  let intentMap = new Map();
  intentMap.set("Default Welcome Intent", welcome);
  intentMap.set("Default Fallback Intent", fallback);
  intentMap.set("Card", cardHandler);
  intentMap.set("Carousel", carouselHandler);
  intentMap.set("Time", timeHandler);
  intentMap.set("Async Time", timeAsyncHandler);
  intentMap.set("Add Country", addCountryHandler);
  intentMap.set("List Countries", listCountryHandler);
  intentMap.set("Delete Country", deleteCountryHandler);
  agent.handleRequest(intentMap);
});
