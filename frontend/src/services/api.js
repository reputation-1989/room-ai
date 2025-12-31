export async function sendPrompt(prompt) {
  const res = await fetch("http://localhost:3000/api/debate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt })
  });

  if (!res.ok) {
    throw new Error("API error");
  }

  return res.json();
}
