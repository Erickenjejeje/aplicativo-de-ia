import fetch from 'node-fetch';

async function test() {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=AIzaSyCwNw16eLlAvU35E7CkO114348U-22GYNk`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    }
  });
  console.log("Status:", res.status);
  const data = await res.json();
  console.log("Models:", data.models?.map(m => m.name).join(', '));
}
test();
