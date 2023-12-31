import {getAttrArray} from "./scraping/getPage";
import fetcher from "./scraping/fetcher";

/**  動画と生放送のURLを取得する
@param channelURL チャンネルのURL
*/
export async function getSmLvInfo(channelURL: string) {
  try {
    const ChannelPage = await fetcher(channelURL);

    const liveData = getAttrArray("g-live-title", "a", "href", "", ChannelPage);
    const liveInfo = [...new Set(liveData)];

    const videoData = getAttrArray(
      "g-video-link",
      "a",
      "href",
      "",
      ChannelPage
    );
    const videoInfo = [...new Set(videoData)];

    return {liveInfo, videoInfo};
  } catch (e) {
    console.log(e);
    console.log("url: " + channelURL);
    return {liveInfo: [], videoInfo: []};
  }
}

export default getSmLvInfo;
