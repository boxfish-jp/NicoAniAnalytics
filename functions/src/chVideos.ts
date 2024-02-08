import fetcher from "./scraping/fetcher";
import Cheerio from "cheerio";
import { getAttrArray, getTagArray } from "./scraping/getPage";

const chVideos = async (chId: string, NanimeDetail: string) => {
  const channelUrl = "https://ch.nicovideo.jp/" + chId + "/video";
  let channelPage = await fetcher(channelUrl);

  let $ = Cheerio.load(channelPage);

  if ($(".p-channelVideo__wrapper").length == 0) {
    const NanimeDetailPage = await fetcher(NanimeDetail);
    const getChid = getAttrArray(
      "_26BSZ",
      "a",
      "href",
      "https://ch.nicovideo.jp/",
      NanimeDetailPage
    );
    if (getChid.length == 0) {
      return [];
    }
    chId = getChid[0].split("/")[3].split("?")[0];
    if (chId === "search") {
      return [];
    }
    const newUrl = "https://ch.nicovideo.jp/" + chId + "/video";

    channelPage = await fetcher(newUrl);

    $ = Cheerio.load(channelPage);
  }

  const videos: {
    id: string;
    doc: {
      title: string;
      url: string;
      thumb: string;
      chId: string;
      postDate: Date;
      description: string;
      viewer: number;
      mylist: number;
      NumComment: number;
      update: number;
    };
  }[] = [];

  $(".item").each((i, elem) => {
    const parseElem = $(elem).html();

    if (parseElem != null) {
      const getTitle = getAttrArray("", ".title a", "title", "", parseElem);
      const title = getTitle[0];

      const getVideoId = getAttrArray("", ".title a", "href", "", parseElem);
      const videoId = getVideoId[0].split("https://www.nicovideo.jp/watch/")[1];

      const getThumb = getAttrArray("", ".item_left img", "src", "", parseElem);
      const thumb = getThumb[0];

      const getLength = getTagArray("", "span.br.badge.length", "", parseElem);
      const lengthMin = getLength[0].split(":")[0];
      if (Number(lengthMin) <= 1) {
        return;
      }

      const getDescription = getTagArray("description", "p", "", parseElem);
      const description = getDescription[0].trim();

      const getPostDate = getAttrArray("", ".time var", "title", "", parseElem);
      const postDate = new Date(getPostDate[0]);

      const getView = getTagArray("", ".view var", "", parseElem);
      const view = Number(getView[0].replace(",", ""));

      const getMylist = getTagArray("", ".mylist var", "", parseElem);

      const mylist = Number(getMylist[0].replace(",", ""));

      const getNumComment = getTagArray("", ".comment var", "", parseElem);
      const numComment = Number(getNumComment[0].replace(",", ""));

      videos.push({
        id: videoId,
        doc: {
          title: title,
          url: "https://www.nicovideo.jp/watch/" + videoId,
          thumb: thumb,
          chId: chId,
          postDate: postDate,
          description: description,
          viewer: view,
          mylist: mylist,
          NumComment: numComment,
          update: new Date().getTime(),
        },
      });
    }
  });

  return videos;
};

export default chVideos;
