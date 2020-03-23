const admin = require("firebase-admin");
const fs = require("fs");

let serviceAccount = require("assistantsample-pblkhd-firebase-adminsdk-ac1rx-d6e074331f.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://assistantsample-pblkhd.firebaseio.com"
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