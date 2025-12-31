const runBtn = document.getElementById("run");
const promptInput = document.getElementById("prompt");
const output = document.getElementById("output");
const finalAnswerEl = document.getElementById("final-answer");
const transcriptEl = document.getElementById("transcript");

runBtn.addEventListener("click", async () => {
  const prompt = promptInput.value.trim();
  if (!prompt) return;

  runBtn.disabled = true;
  runBtn.textContent = "Running...";
  output.classList.add("hidden");

  try {
    const res = await fetch("/api/debate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt })
    });

    const data = await res.json();

    finalAnswerEl.textContent = data.finalAnswer || "No answer.";

    transcriptEl.innerHTML = "";
    if (Array.isArray(data.transcript)) {
      data.transcript.forEach(step => {
        const div = document.createElement("div");
        div.className = "reason-step";

        div.innerHTML = `
          <h3>${step.phase.toUpperCase()}</h3>
          <pre>${JSON.stringify(step.output || step, null, 2)}</pre>
        `;
        transcriptEl.appendChild(div);
      });
    }

    output.classList.remove("hidden");
  } catch (err) {
    alert("Something went wrong.");
    console.error(err);
  } finally {
    runBtn.disabled = false;
    runBtn.textContent = "Run";
  }
});
