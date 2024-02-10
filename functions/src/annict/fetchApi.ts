import * as dotenv from "dotenv";
dotenv.config();

const fetchApi = async (title: string, query: string) => {
  try {
    const response = await fetch("https://api.annict.com/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // ここに必要なヘッダーを追加
        Authorization: "Bearer " + process.env.ANNICT_API_KEY,
      },
      body: JSON.stringify({ query }),
    });
    if (!response.ok) {
      const json = await response.json();
      console.error("Network response was not ok", json);
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error:", error);
    return "error";
  }
};

export default fetchApi;
