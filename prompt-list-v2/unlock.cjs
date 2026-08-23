async function unlockAll() {
  const users = ["uU5AYNATAZTud6OgrYO0D84mGSH2", "sh5XnVyGYjSlLAXvaRS4ARe7j123", "cP0DdbCFQ3R7lP5vREWJP23Qz1y2"];
  const prompts = ["0NRxUwjeVvQUdXoLgk7a", "CF2ZKT9vq3rhTwN3VScm", "FQHvOSMpKDRk5gH4r6r6", "G0wiyW0hogT3EzbODFST", "JEIyiPK3SD7TYk8GAugb", "Rdf44xJapx6a3aoQxzxQ", "Wn4G49AyYjYgNBEjB2Pc", "XQHiR1yM28NtEelHIB3g", "dj44vCSkVDrrwVv0kj5O", "fb2FCu2uyUjXx2vDPx11", "yuSvV2of6z6YeXdvzy4P", "z3gFwKrfv6P8FbsbclBq"];
  
  for (const userId of users) {
    for (const promptId of prompts) {
      const payload = {
        type: "payment.succeeded",
        data: { metadata: { user_id: userId, prompt_id: promptId } }
      };
      await fetch("https://olin-prompt-list1.pages.dev/api/whop/webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
    }
  }
  console.log("Done");
}
unlockAll();
