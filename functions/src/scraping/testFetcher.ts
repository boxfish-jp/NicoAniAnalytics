const fetcher = async (url: string) => {
  try {
    const curl = await fetch(url);
    const page = await curl.text();
    console.log("fetch success");
    return page;
  } catch (error) {
    console.log("error:" + url + " :" + error);
    return "error";
  }
};

export default fetcher;
