import fetcher from "./fetcher";
import cheerio from "cheerio";

const videoApi = async (videoID: string) => {
  const endpoint = "https://ext.nicovideo.jp/api/getthumbinfo/" + videoID;

  try {
    const videoInfo = await fetcher(endpoint);
    const $ = cheerio.load(videoInfo, {
      xmlMode: true,
    });
    const videoTitle = $("title").text();
    const viewCount = $("view_counter").text();
    const thumbnail = $("thumbnail_url").text();
    const chIcon = $("ch_icon_url").text();

    if (
      videoTitle == "" ||
      viewCount == "" ||
      thumbnail == "" ||
      chIcon == ""
    ) {
      return "error";
    }

    return {
      title: videoTitle,
      viewCount: viewCount,
      thumbnail: thumbnail,
      chIcon: chIcon,
    };
  } catch (e) {
    console.log(e);
    return "error";
  }
};

export default videoApi;
