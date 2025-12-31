export const fetchDebate = async (prompt, solverModel, verifierModel) => {
  const response = await fetch("/api/debate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ 
      prompt,
      solverModel,
      verifierModel
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Council connection failed.");
  }
  
  return await response.json();
};
