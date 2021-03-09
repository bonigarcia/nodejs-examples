const admin = require("firebase-admin");
const fs = require("fs");

// FIXME: Go to IAM & admin > Service accounts in the Cloud Platform Console
// (https://console.cloud.google.com/iam-admin/serviceaccounts) and generate
// a private key and save as as JSON file
const serviceAccount = require("../uc3m-it-2021-16147-teachers-3dce9f913dbc.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

(async () => {
    try {
        // Read JSON from file
        let rawdata = fs.readFileSync("example.json");
        let example = JSON.parse(rawdata);

        // Add data to Firestore in native mode
        await db.collection("json").doc("example").set(example);
        console.log("Added JSON to Firestore:", example);

        // Read data
        let readDoc = await db.collection("json").doc("example").get();
        console.log("Read JSON from Firestore:", readDoc);
        console.log("Accesing to data:", readDoc.data().firstName, readDoc.data().lastName);

    } catch (error) {
        console.error("Error happened:", error);
    }
})();