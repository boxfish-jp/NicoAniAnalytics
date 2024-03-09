const dbFetcher = async (url: string) => {
  let errorMes = "";
  for (let i = 0; i < 10; i++) {
    try {
      const data = await fetch(url);
      return data;
    } catch (error) {
      errorMes = String("dbAPIError:" + error);
      console.error(errorMes);
    }
    // 1秒待つ
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  throw new Error(errorMes);
};

export default dbFetcher;
