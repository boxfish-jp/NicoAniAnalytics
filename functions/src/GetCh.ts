import Cheerio from "cheerio";
import { getAttrArray, getTagArray } from "./scraping/getPage";
import fetcher from "./scraping/testFetcher";

const errorMess = (message: string) => ({
  season: message + ":error",
  channels: [],
});

const getCh = async (Nanime: string) => {
  const SeasonPage = await fetcher(Nanime);

  const ogImage: string[] = getAttrArray(
    "",
    "meta[property='og:image']",
    "content",
    "",
    SeasonPage
  );

  if (ogImage.length != 0) {
    const season = ogImage[0]
      .split("https://anime.nicovideo.jp/assets/images/")[1]
      .split(".jpg")[0];

    console.log(season);

    const channelDic: {
      season: string;
      channels: {
        chId: string;
        document: {
          title: string;
          thumb: string;
          NanimeDetail: string;
          chUrl: string;
          detail: string;
          latestFree: boolean;
          premium: boolean;
        };
      }[];
    } = { season: season, channels: [] };

    const $ = Cheerio.load(SeasonPage);
    $(".ynMe4").each((i, elem) => {
      // カード一つ一つの処理をここに書く。
      // この中でデータを取る
      const parseElem = $(elem).html();

      if (parseElem != null) {
        const getTitle = getTagArray("gDySc", "h2", "", parseElem);
        const title = getTitle[0];

        const getThumb = getAttrArray("", "._3ke9H img", "src", "", parseElem);
        const thumb =
          "https://anime.nicovideo.jp" + getThumb[0].replace("_S", "_L");

        const getChAvail = getTagArray("J9hxP", "div", "", parseElem);

        const getDetail = getTagArray("_bV14", "p", "", parseElem);
        const detail = getDetail[0];

        if (getChAvail[0]) {
          const getCh = getAttrArray("_2R1vQ", "a", "href", "", parseElem);

          const getProvide = getTagArray("_2ZVYy", "li", "", parseElem);
          const latestFree = getProvide.some((item) =>
            item.includes("最新話無料")
          );
          const premium = getProvide.some((item) =>
            item.includes("プレミアム会員 見放題")
          );

          const NanimeDetail =
            "https://anime.nicovideo.jp" + getCh[0].split("?from=")[0];

          const chId = getCh[0].split("/")[2];
          const chUrl = "https://ch.nicovideo.jp/" + chId;

          const document = {
            title: title,
            thumb: thumb,
            NanimeDetail: NanimeDetail,
            chUrl: chUrl,
            detail: detail,
            latestFree: latestFree,
            premium: premium,
          };

          channelDic.channels.push({ chId: chId, document: document });
        }
      }
    });
    return channelDic;
  } else {
    return errorMess("seasonPage");
  }
};

export default getCh;
