async function getUsers() {
  const res = await fetch("https://firestore.googleapis.com/v1/projects/promptlist-15659/databases/(default)/documents/users");
  const data = await res.json();
  const users = data.documents.map(d => {
    return {
      id: d.name.split('/').pop(),
      email: d.fields?.email?.stringValue,
      displayName: d.fields?.displayName?.stringValue
    };
  });
  console.log(JSON.stringify(users, null, 2));
}
getUsers();
