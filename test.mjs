import fetch from 'node-fetch';

async function test() {
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer sk-or-v1-fakekey"
    },
    body: JSON.stringify({
      model: "openai/gpt-5.5",
      messages: [{role: "user", content: "test"}]
    })
  });
  console.log("Status:", res.status);
  console.log("Body:", await res.text());
}
test();
