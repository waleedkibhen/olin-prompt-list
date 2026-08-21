async function test() {
  const res = await fetch('https://api.whop.com/api/v2/products', {
    headers: { Authorization: "Bearer apik_2CfsbKSmO9GOL_C5388822_C_82def646b456fafa4713cc95b5871e3cac59be30a306b469ac8d6c87f494cc" }
  });
  const text = await res.text();
  console.log(text);
}
test();
