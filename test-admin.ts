import admin from 'firebase-admin';

try {
  let firebaseConfig: any = {};
  try {
    const fs = await import('fs');
    firebaseConfig = JSON.parse(fs.readFileSync("./firebase-applet-config.json", "utf-8"));
  } catch (e) {}

  admin.initializeApp({
    projectId: firebaseConfig.projectId
  });
  const db = admin.firestore();
  console.log("Adding doc...");
  await db.collection("pending_posts").add({ test: true });
  console.log("Success! Project ID:", admin.app().options.projectId);
} catch (error) {
  console.error("Error:", error);
}
