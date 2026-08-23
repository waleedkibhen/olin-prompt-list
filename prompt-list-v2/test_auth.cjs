const fs = require('fs');

async function base64ToUint8Array(base64) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function base64urlEncode(str) {
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function testAuth() {
  const serviceAccount = JSON.parse(fs.readFileSync('temp_sa.json', 'utf8'));
  
  const header = { alg: "RS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: serviceAccount.client_email,
    scope: "https://www.googleapis.com/auth/datastore",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now
  };

  const unsignedToken = base64urlEncode(JSON.stringify(header)) + "." + base64urlEncode(JSON.stringify(payload));
  const pem = serviceAccount.private_key
    .replace(/-----BEGIN PRIVATE KEY-----/, "")
    .replace(/-----END PRIVATE KEY-----/, "")
    .replace(/\s+/g, "");
    
  const keyBuffer = await base64ToUint8Array(pem);
  
  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    keyBuffer.buffer,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const encoder = new TextEncoder();
  const signatureBuffer = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", cryptoKey, encoder.encode(unsignedToken));
  const signature = btoa(String.fromCharCode(...new Uint8Array(signatureBuffer)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  const jwt = `${unsignedToken}.${signature}`;
  
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`
  });
  const data = await response.json();
  console.log("Token response:", Object.keys(data));
  if (!data.access_token) {
    console.log("Failed:", data);
    return;
  }
  
  const token = data.access_token;
  const projectId = serviceAccount.project_id;
  const userId = "test_user_123";
  const promptId = "test_prompt_123";
  
  const commitUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:commit`;
  
  const transformPayload = {
    writes: [
      {
        transform: {
          document: `projects/${projectId}/databases/(default)/documents/users/${userId}`,
          fieldTransforms: [
            {
              fieldPath: "purchasedPrompts",
              appendMissingElements: {
                values: [{ stringValue: promptId }]
              }
            }
          ]
        }
      }
    ]
  };

  const firestoreRes = await fetch(commitUrl, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(transformPayload)
  });
  
  console.log("Firestore status:", firestoreRes.status);
  const text = await firestoreRes.text();
  console.log("Firestore response:", text);
}
testAuth();
