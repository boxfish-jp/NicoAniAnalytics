import Cheerio from "cheerio";
import {getAttrArray, getTagArray} from "./scraping/getPage";
import fetcher from "./scraping/fetcher";

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
          chUrl: string;
          detail: string;
        };
      }[];
    } = {season: season, channels: []};

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

        console.log("title:", title, "thumb:", thumb);

        const getDetail = getTagArray("_bV14", "p", "", parseElem);
        const detail = getDetail[0];
        console.log("detail:", detail);

        if (getChAvail[0]) {
          const getCh = getAttrArray("_2R1vQ", "a", "href", "", parseElem);

          const chId = getCh[0].split("/")[2];

          const chUrl = "https://ch.nicovideo.jp/" + chId;

          console.log("chUrl:", chUrl);
          const document = {
            title: title,
            thumb: thumb,
            chUrl: chUrl,
            detail: detail,
          };

          channelDic.channels.push({chId: chId, document: document});
        }
      }
    });
    return channelDic;
  } else {
    return errorMess("seasonPage");
  }
};

export default getCh;
