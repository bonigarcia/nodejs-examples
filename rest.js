const request = require('request');
const dateFormat = require('dateformat');

function logError(error) {
    console.error("Error happened:", error);
}

function logTime(time) {
    console.log("Time object:", time);
    let currentDateTime = dateFormat(time.currentDateTime, "dd/mmmm/yyyy, h:MM:ss TT");
    console.log("Current time: " + currentDateTime + " (" + time.timeZoneName + ")");
}

// Warning: As of Feb 11th 2020, request is fully deprecated
// https://www.npmjs.com/package/request
// See: https://github.com/request/request/issues/3142

let worldClockApiUrl = 'http://worldclockapi.com/api/json/cet/now';
request(worldClockApiUrl, function (error, response) {
    if (error) {
        logError(error);
    } else {
        console.log("*** Using request (callback) ***");
        logTime(JSON.parse(response.body));
    }
});

// Alternatives to request: https://github.com/request/request/issues/3143
// For example: https://www.npmjs.com/package/axios

const axios = require('axios').default;

axios.get(worldClockApiUrl)
    .then(function (response) {
        console.log("*** Using axios (promises) ***");
        logTime(response.data);
    })
    .catch(function (error) {
        logError(error);
    });

const getTime = async () => {
    try {
        let response = await axios.get(worldClockApiUrl);
        console.log("*** Using axios (async/wait) ***");
        logTime(response.data);
    } catch (error) {
        logError(error);
    }
}
getTime();
