const req = {
  company_id: "biz_Cl76q9At9iiox0",
  mode: "payment",
  plan: {
    company_id: "biz_Cl76q9At9iiox0",
    initial_price: 1.0,
    plan_type: "one_time",
    currency: "usd"
  }
};

async function test() {
  const res = await fetch("https://api.whop.com/api/v1/checkout_configurations", {
    method: "POST",
    headers: {
      "Authorization": "Bearer apik_2CfsbKSmO9GOL_C5388822_C_82def646b456fafa4713cc95b5871e3cac59be30a306b469ac8d6c87f494cc",
      "Content-Type": "application/json"
    },
    body: JSON.stringify(req)
  });
  const text = await res.text();
  console.log("STATUS:", res.status);
  console.log("BODY:", text);
}
test();
