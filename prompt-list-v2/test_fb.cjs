const fs = require('fs');

async function checkFirebase() {
  // Let's create a script that uses the real FIREBASE_SERVICE_ACCOUNT to check
  // Oh, wait, I don't have the FIREBASE_SERVICE_ACCOUNT variable locally!
  // But wait, the user provided their FIREBASE_SERVICE_ACCOUNT in a previous message!
  console.log("I need the service account to query");
}

checkFirebase();
