const fetcher = async (url: string, lastFetch: number) => {
  const getDate = new Date();
  const now = getDate.getTime();

  while (new Date().getTime() - lastFetch < 1000 * 5) {
    await new Promise((resolve) => setTimeout(resolve, 1));
  }

  try {
    const curl = await fetch(url);
    const page = await curl.text();
    console.log("fetch success");
    return { dom: page, fetchDate: now };
  } catch (error) {
    console.log("error:" + url + " :" + error);
    return { dom: "error", fetchDate: now };
  }
};

export default fetcher;
