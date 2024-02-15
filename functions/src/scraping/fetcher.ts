const fetcher = async (url: string, lastFetch: number) => {
  while (new Date().getTime() - lastFetch < 1000 * 5) {
    await new Promise((resolve) => setTimeout(resolve, 1));
  }
  const now = new Date().getTime();

  try {
    const curl = await fetch(url);
    const page = await curl.text();
    return { dom: page, fetchTime: now };
  } catch (error) {
    console.log("error:" + url + " :" + error);
    return { dom: "error", fetchTime: now };
  }
};

export default fetcher;
