import {getAttrArray, getTagArray} from "./scraping/getPage";
import fetcher from "./scraping/fetcher";

const descience = [
  " [アニメ無料動画配信]｜ニコニコのアニメサイト：Nアニメ",
  "｜ニコニコのアニメサイト：Nアニメ",
  "：Nアニメ",
];

const errorMess = (message: string) => ({
  season: message + ":error",
  channels: [],
});

const getChannels = async (page: string) => {
  const SeasonPage = await fetcher(page);

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

    const brokenUrls: string[] = getAttrArray(
      "_2R1vQ",
      "a",
      "href",
      "/detail",
      SeasonPage
    );
    const animesPage: string[] = brokenUrls.map(
      (url) => "https://anime.nicovideo.jp" + url.split("?from")[0]
    );

    const channels: { title: string; Channelurl: string }[] = [];

    for (let i = 0; i < animesPage.length; i++) {
      try {
        const detailInfo = await fetcher(animesPage[i]);
        const getTitle = getTagArray("", "title", "", detailInfo);
        if (getTitle.length == 0) {
          return errorMess("getTitle from: " + animesPage[i]);
        }
        let title = getTitle[0];
        for (let j = 0; j < descience.length; j++) {
          title = title.replace(descience[j], "");
        }

        const GetChannel = getAttrArray(
          "_26BSZ",
          "a",
          "href",
          "https://ch.nicovideo.jp/",
          detailInfo
        );
        if (GetChannel.length != 0) {
          if (!GetChannel[0].startsWith("https://ch.nicovideo.jp/search/")) {
            const channel = GetChannel[0].split("?from")[0];
            channels.push({title: title, Channelurl: channel});
          }
        }
      } catch (e) {
        console.log(e);
        return errorMess("error");
      }
    }
    return {
      season: season,
      channels: channels,
    };
  } else {
    return errorMess("seasonPage");
  }
};

export default getChannels;
