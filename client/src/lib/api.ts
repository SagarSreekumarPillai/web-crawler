export async function addUrl(url: string) {
    const response = await fetch("http://localhost:8080/api/urls", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url }),
    });
  
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || "Failed to add URL");
    }
  
    return response.json();
  }
  