async function getPosts() {
  const res = await fetch("https://firestore.googleapis.com/v1/projects/promptlist-15659/databases/(default)/documents/posts");
  const data = await res.json();
  const posts = data.documents.map(d => {
    return {
      id: d.name.split('/').pop(),
      title: d.fields?.title?.stringValue,
      creatorId: d.fields?.creatorId?.stringValue
    };
  });
  console.log(JSON.stringify(posts, null, 2));
}
getPosts();
