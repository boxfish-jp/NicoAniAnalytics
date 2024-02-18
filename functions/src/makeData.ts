import getAnnict from "./annict/getAnnict";

import { ChannelsType } from "./type/channelType";
import VideoArrType from "./type/videoArrType";

const makeDBData = async (
  channel: ChannelsType,
  chUrl: string,
  videoArr: VideoArrType
) => {
  let sumComments = 0;
  let sumMylists = 0;
  let sumViewers = 0;
  const videoData: VideoArrType = [];
  videoArr.forEach(async (video) => {
    // 平均を計算
    sumComments += Number(video.doc.NumComment);
    sumMylists += Number(video.doc.mylist);
    sumViewers += Number(video.doc.viewer);

    // videoIdを日付付きで更新
    const updateMonth = new Date().getMonth();
    const updateDay = new Date().getDate();
    video.id = video.id + "-" + String(updateMonth) + "-" + String(updateDay);

    videoData.push(video);
  });

  // ChListのデータをデータベースに保存
  const aveComments = sumComments
    ? Math.trunc(sumComments / videoArr.length)
    : 0;
  const aveMylists = sumMylists ? Math.trunc(sumMylists / videoArr.length) : 0;
  const aveViewers = sumViewers ? Math.trunc(sumViewers / videoArr.length) : 0;

  const videoIds = videoArr.map((video) => video.id);

  if (videoArr.length != 0) {
    const docId = channel.NanimeDetail.split("/")[4];
    const AnnictData = await getAnnict(channel.title);
    const document = {
      chUrl: chUrl,
      detail: channel.detail,
      thumb: channel.thumb,
      title: channel.title,
      latestFree: channel.latestFree,
      premium: channel.premium,
      aveComments: aveComments,
      aveMylists: aveMylists,
      aveViewers: aveViewers,
      videoIds: videoIds,
      twitter: AnnictData.twitter,
      site: AnnictData.siteUrl,
      casts: AnnictData.casts,
      staffs: AnnictData.staffs,
    };
    return { chDocId: docId, chDoc: document, videos: videoArr };
  } else {
    return undefined;
  }
};

export default makeDBData;
