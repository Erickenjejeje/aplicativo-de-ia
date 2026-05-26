import fetch from 'node-fetch';

async function test(model) {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=AIzaSyCwNw16eLlAvU35E7CkO114348U-22GYNk`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [{role: "user", parts: [{text: "Hi"}]}]
    })
  });
  console.log(model, "Status:", res.status);
  console.log(model, "Body:", await res.text());
}
test('gemini-3.5-flash');
test('gemini-3.1-pro-preview');
