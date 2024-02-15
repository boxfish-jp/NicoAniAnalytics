import fetcher from "./scraping/fetcher";
import { getAttrArray } from "./scraping/getPage";

const getDetail = async (url: string, lastFetch: number) => {
  const fetchData = await fetcher(url, lastFetch);
  const dom = fetchData.dom;

  const getUrl = getAttrArray(
    "_26BSZ",
    "a",
    "href",
    "https://ch.nicovideo.jp/",
    dom
  );
  for (url of getUrl) {
    if (!url.startsWith("https://ch.nicovideo.jp/search/")) {
      url = url.split("?")[0];
      return { chUrl: url, fetchTime: fetchData.fetchTime };
    }
  }
  return { chUrl: "", fetchTime: fetchData.fetchTime };
};

export default getDetail;
