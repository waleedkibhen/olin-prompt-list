async function inspectPosts() {
  const res = await fetch("https://firestore.googleapis.com/v1/projects/promptlist-15659/databases/(default)/documents/posts?pageSize=50");
  const data = await res.json();
  if (!data.documents) {
    console.log('No documents or error:', data);
    return;
  }
  const summary = data.documents.map(d => {
    const fields = d.fields || {};
    return {
      id: d.name.split('/').pop(),
      title: fields.title?.stringValue,
      monetizationType: fields.monetizationType?.stringValue,
      isPaid: fields.isPaid?.booleanValue,
      paidUnlockMethod: fields.paidUnlockMethod?.stringValue,
      unlockMethod: fields.unlockMethod?.stringValue,
      price: fields.price?.doubleValue || fields.price?.integerValue
    };
  });
  console.log(JSON.stringify(summary, null, 2));
}
inspectPosts();
