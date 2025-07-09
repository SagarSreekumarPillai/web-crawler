
export async function addUrl(url: string) {
    const response = await fetch("https://httpbin.org/post", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer dummy-token", // Replace later
      },
      body: JSON.stringify({ url }),
    });
  
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || "Failed to add URL");
    }
  
    return response.json();
  }
  