import fetcher from "./scraping/fetcher";
import Cheerio from "cheerio";
import { getAttrArray, getTagArray } from "./scraping/getPage";

type videosType = {
  update: number;
  lengthMin: number;
  video: {
    ch_id: number;
    ch_seq: number;
    ch_seq_url: string;
    ch_seq_id: number;
    ch_seq_title: string;
    ch_seq_thumb: string;
    ch_seq_desc: string;
    ch_seq_posted: Date;
  };
  viewData: {
    viewer: number;
    mylist: number;
    NumComment: number;
  };
}[];

const parseData = (dom: string, ch_id: number) => {
  const getTitle = getAttrArray("", ".title a", "title", "", dom);
  const ch_seq_title = getTitle[0];

  const getVideoId = getAttrArray("", ".title a", "href", "", dom);
  const ch_seq_url = getVideoId[0];

  const ch_seq_id = Number(ch_seq_url.split("/")[4].replace("so", ""));

  const getThumb = getAttrArray("", ".item_left img", "src", "", dom);
  const ch_seq_thumb = getThumb[0];

  const getLength = getTagArray("", "span.br.badge.length", "", dom);
  const lengthMin = getLength[0].split(":")[0];

  const getDescription = getTagArray("description", "p", "", dom);
  const ch_seq_desc = getDescription[0].trim();

  const getPostDate = getAttrArray("", ".time var", "title", "", dom);
  const ch_seq_posted = new Date(getPostDate[0]);

  const getView = getTagArray("", ".view var", "", dom);
  const view = Number(getView[0].replace(",", ""));

  const getMylist = getTagArray("", ".mylist var", "", dom);
  const mylist = Number(getMylist[0].replace(",", ""));

  const getComment = getTagArray("", ".comment var", "", dom);
  const comment = Number(getComment[0].replace(",", ""));

  return {
    update: new Date().getTime(),
    lengthMin: Number(lengthMin),
    video: {
      ch_id: ch_id,
      ch_seq: 0,
      ch_seq_url: ch_seq_url,
      ch_seq_id: ch_seq_id,
      ch_seq_title: ch_seq_title,
      ch_seq_thumb: ch_seq_thumb,
      ch_seq_desc: ch_seq_desc,
      ch_seq_posted: ch_seq_posted,
    },
    viewData: {
      viewer: view,
      mylist: mylist,
      NumComment: comment,
    },
  };
};

const chVideos = async (chUrl: string, lastFetch: number) => {
  const channelUrl = chUrl + "/video";
  let channelPage = await fetcher(channelUrl, lastFetch);
  lastFetch = channelPage.fetchTime;
  while (channelPage.dom === "error") {
    channelPage = await fetcher(channelUrl, lastFetch);
    lastFetch = channelPage.fetchTime;
  }

  const $ = Cheerio.load(channelPage.dom);

  const videos: videosType = [];

  const getCh_id = getAttrArray(
    "",
    ".c-footerCp__container__overview__symbolImage a",
    "href",
    "",
    channelPage.dom
  );
  const chId = Number(getCh_id[0].replace("/ch", ""));

  const get_video_amount = getTagArray("", ".count var", "", channelPage.dom);
  const video_amount = Number(get_video_amount[0]);
  $(".item").each((i, elem) => {
    const parseElem = $(elem).html();

    if (parseElem != null) {
      const video = parseData(parseElem, chId);
      videos.push(video);
    }
  });

  let page = 2;
  while (videos.length < video_amount) {
    const nextUrl = channelUrl + "?page=" + page;
    let nextPage = await fetcher(nextUrl, lastFetch);
    lastFetch = channelPage.fetchTime;
    while (nextPage.dom === "error") {
      nextPage = await fetcher(nextUrl, lastFetch);
      lastFetch = channelPage.fetchTime;
    }
    const $ = Cheerio.load(nextPage.dom);
    $(".item").each((i, elem) => {
      const parseElem = $(elem).html();
      if (parseElem != null) {
        const video = parseData(parseElem, chId);
        videos.push(video);
      }
    });
    page++;
  }

  videos.sort((a, b) => {
    return new Date(b.update).getTime() - new Date(a.update).getTime();
  });

  let seq_counter = 1;
  for (let i = 0; i < videos.length; i++) {
    if (videos[i].lengthMin >= 3) {
      videos[i].video.ch_seq = seq_counter;
      seq_counter++;
    }
  }

  return {
    videos: videos.filter((video) => video.video.ch_seq !== 0),
    fetchTime: channelPage.fetchTime,
  };
};

export default chVideos;
