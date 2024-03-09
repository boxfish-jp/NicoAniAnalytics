import fetcher from "./scraping/fetcher";
import { getAttrArray } from "./scraping/getPage";

const getDetail = async (url: string, lastFetch: number) => {
  let fetchData = await fetcher(url, lastFetch);
  lastFetch = fetchData.fetchTime;
  while (fetchData.dom === "error") {
    fetchData = await fetcher(url, lastFetch);
    lastFetch = fetchData.fetchTime;
  }
  const dom = fetchData.dom;

  const getUrl = getAttrArray(
    "_26BSZ",
    "a",
    "href",
    "https://ch.nicovideo.jp/",
    dom
  );
  let chUrl = "";
  for (url of getUrl) {
    if (!url.startsWith("https://ch.nicovideo.jp/search/")) {
      url = url.split("?")[0];
      chUrl = url;
    }
  }

  const getSiteUrl = getAttrArray("UcsAu", "a", "href", "", dom);
  let siteUrl = "undefined";
  for (url of getSiteUrl) {
    if (!url.startsWith("https://dic.nicovideo.jp")) {
      siteUrl = url;
    }
  }

  return { chUrl: chUrl, siteUrl: siteUrl, fetchTime: fetchData.fetchTime };
};

export default getDetail;
