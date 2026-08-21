async function test() {
  const res = await fetch('https://api.whop.com/api/v2/companies', {
    headers: { Authorization: "Bearer apik_ehGz6NoKEOfQv_C5388822_C_4ef6b481f1f55c864cab889eeada81dda783fa0f1257ac1654cd863031830c" }
  });
  const text = await res.text();
  console.log(text);
}
test();
