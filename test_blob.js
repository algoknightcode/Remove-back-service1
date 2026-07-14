const { removeBackground } = require('@imgly/background-removal-node');

async function run() {
  try {
    const base64jpeg = "/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAGBAQABPxA=";
    const buffer = Buffer.from(base64jpeg, 'base64');
    const blob = new Blob([buffer], { type: 'image/jpeg' });
    console.log("Blob created, size:", blob.size);
    const resultBlob = await removeBackground(blob);
    console.log("Success!", resultBlob);
  } catch (e) {
    console.error("Error:", e);
  }
}
run();
