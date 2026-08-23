async function testWebhook() {
  const payload = {
    type: "payment.succeeded",
    data: {
      metadata: {
        user_id: "uU5AYNATAZTud6OgrYO0D84mGSH2",
        prompt_id: "CF2ZKT9vq3rhTwN3VScm"
      }
    }
  };
  
  const res = await fetch("https://olin-prompt-list1.pages.dev/api/whop/webhook", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "whop-signature": "dummy"
    },
    body: JSON.stringify(payload)
  });
  
  const text = await res.text();
  console.log("Status:", res.status);
  console.log("Response:", text);
}
testWebhook();
