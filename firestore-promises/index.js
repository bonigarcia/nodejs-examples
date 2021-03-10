const admin = require("firebase-admin");

// FIXME: Go to IAM & admin > Service accounts in the Cloud Platform Console
// (https://console.cloud.google.com/iam-admin/serviceaccounts) and generate
// a private key and save as as JSON file
const serviceAccount = require("../uc3m-it-2021-16147-teachers-3dce9f913dbc.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// 1. Add data
// https://firebase.google.com/docs/firestore/manage-data/add-data

// 1a. Add a new document with a generated id
let tokyo = {
    name: "Tokyo",
    country: "Japan"
};
let addDoc = db.collection("cities").add(tokyo).then(ref => {
    let tokyoId = ref.id;
    console.log("Added document with ID:", tokyoId, tokyo);

    // 2. Delete data
    // https://firebase.google.com/docs/firestore/manage-data/delete-data
    let deleteDoc = db.collection("cities").doc(tokyoId).delete();
    console.log("Deleted document with ID:", tokyoId);
});

// 1b. Add a new document in collection "cities" with ID "LA"
let losAngeles = {
    name: "Los Angeles",
    state: "CA",
    country: "USA"
};
let setDoc = db.collection("cities").doc("LA").set(losAngeles).then(() => {
    // 3. Update
    // https://firebase.google.com/docs/firestore/manage-data/add-data

    console.log("City before update:", losAngeles);
    let updateCountry = db.collection("cities").doc("LA").update({
        country: "United States of America"
    }).then(() => {
        // 4. Read data
        // https://firebase.google.com/docs/firestore/query-data/get-data
        let allCities = db.collection("cities").get()
            .then(snapshot => {
                snapshot.forEach(doc => {
                    console.log(doc.id, "=>", doc.data());
                });
            })
            .catch(err => {
                console.log("Error getting documents", err);
            });
    });

});
