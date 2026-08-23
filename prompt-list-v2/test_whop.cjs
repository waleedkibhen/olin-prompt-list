async function testWhop() {
  const apiKey = "apik_2CfsbKSmO9GOL_C5388822_C_82def646b456fafa4713cc95b5871e3cac59be30a306b469ac8d6c87f494cc";
  const companyId = "biz_Cl76q9At9iiox0";
  
  const res = await fetch("https://api.whop.com/api/v1/checkout_configurations", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: JSON.stringify({
      mode: "payment",
      plan: {
        company_id: companyId,
        currency: "usd",
        initial_price: 1,
        plan_type: "one_time"
      },
      metadata: {
        prompt_id: "test",
        user_id: "test",
        title: "test"
      }
    })
  });
  
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}

testWhop();
