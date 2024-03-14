import { db } from "./db/firebase";

const endpoint = "https://nico_ani_hono.boxfish893.workers.dev";

type d1VideoType = {
  video_id: number;
  vaddtime: Date;
  ch_id: number;
  ch_seq: number;
  ch_seq_id: number;
  ch_seq_url: string;
  ch_seq_title: string;
  ch_seq_thumb: string;
  ch_seq_desc: string;
  ch_seq_posted: Date;
};

type fbviewDataType = {
  NumComment: number;
  chId: string;
  description: string;
  mylist: number;
  postDate: Date;
  thumb: string;
  title: string;
  update: number;
  url: string;
  viewer: number;
};

type viewDataType = {
  ch_id: number;
  ch_seq: number;
  ch_seq_id: number;
  daddtime: Date;
  view_amount: number;
  mylist_amount: number;
  comment_amount: number;
  diff_view: number;
  diff_mylist: number;
  diff_comment: number;
};

type d1ChlistType = {
  chlist_id: number;
  caddtime: Date;
  ch_id: number;
  ch_title: string;
  ch_url: string;
  ch_detail: string;
  ch_LtstFree: number;
  ch_PrmFree: number;
  syear: number;
  season: string;
  ch_twt: string;
  ch_site: string;
  ch_thumb: string;
};

type d1RankingType = {
  ch_id: number;
  raddtime: Date;
  r_current_seq: number;
  r_total_view: number;
  r_total_mylist: number;
  r_total_comment: number;
  r_ave_view: number;
  r_ave_mylist: number;
  r_ave_comment: number;
  r_ave_view_rank: number;
  r_ave_mylist_rank: number;
  r_ave_comment_rank: number;
  r_diff_view: number;
  r_diff_mylist: number;
  r_diff_comment: number;
};

const d1fetcher = async (url: string) => {
  for (let i = 0; i < 3; i++) {
    try {
      const res = await fetch(url);
      if (res.status == 200) {
        return res;
      } else {
        console.log(await res.json());
      }
    } catch (e) {
      console.log(e);
    }
  }
  return "error";
};

const d1Videos = async () => {
  const getVideoUrl = new URL(endpoint + "/videos");
  const videoRes = await d1fetcher(getVideoUrl.href);
  if (videoRes != "error") {
    const videoJson = (await videoRes.json()) as {
      result: d1VideoType[];
    };
    if (videoJson.result.length > 0) {
      return videoJson.result;
    } else {
      return "error";
    }
  } else {
    return "error";
  }
};

const d1Chlist = async () => {
  const getChlistUrl = new URL(endpoint + "/chlist");
  const chlistRes = await d1fetcher(getChlistUrl.href);
  if (chlistRes != "error") {
    const videoJson = (await chlistRes.json()) as {
      result: d1ChlistType[];
    };
    if (videoJson.result.length > 0) {
      return videoJson.result;
    } else {
      return "error";
    }
  } else {
    return "error";
  }
};

const d1SetViewData = async (doc: viewDataType) => {
  const getChlistUrl = new URL(endpoint + "/viewData/create");
  const getChlistParams = new URLSearchParams([
    ["ch_id", String(doc.ch_id)],
    ["ch_seq", String(doc.ch_seq)],
    ["ch_seq_id", String(doc.ch_seq_id)],
    ["daddtime", doc.daddtime.toISOString()],
    ["view_amount", String(doc.view_amount)],
    ["mylist_amount", String(doc.mylist_amount)],
    ["comment_amount", String(doc.comment_amount)],
    ["diff_view", String(doc.diff_view)],
    ["diff_mylist", String(doc.diff_mylist)],
    ["diff_comment", String(doc.diff_comment)],
  ]);
  getChlistUrl.search = getChlistParams.toString();
  const chlistRes = await d1fetcher(getChlistUrl.href);
  if (chlistRes == "error") {
    throw new Error("viewData register error");
  }
};

const getFbviewData = async (ch_seq_url: string) => {
  const getViewData = await db
    .collection("2024-winter")
    .where("url", "==", ch_seq_url)
    .get();
  if (getViewData.docs.length > 0) {
    const array: fbviewDataType[] = [];
    getViewData.forEach((doc) => {
      array.push({
        NumComment: doc.data().NumComment,
        chId: doc.data().chId,
        description: doc.data().description,
        mylist: doc.data().mylist,
        postDate: doc.data().postDate.toDate(),
        thumb: doc.data().thumb,
        title: doc.data().title,
        update: doc.data().update,
        url: doc.data().url,
        viewer: doc.data().viewer,
      });
    });
    return array;
  } else {
    return "error";
  }
};

const makeViewData = (video: d1VideoType, fbView: fbviewDataType) => {
  return {
    ch_id: video.ch_id,
    ch_seq: video.ch_seq,
    ch_seq_id: video.ch_seq_id,
    daddtime: new Date(fbView.update),
    view_amount: fbView.viewer,
    mylist_amount: fbView.mylist,
    comment_amount: fbView.NumComment,
    diff_view: 0,
    diff_mylist: 0,
    diff_comment: 0,
  };
};

const d1SetRanking = async (doc: d1RankingType) => {
  const getChlistUrl = new URL(endpoint + "/ranking/create");
  const getChlistParams = new URLSearchParams([
    ["ch_id", String(doc.ch_id)],
    ["raddtime", doc.raddtime.toISOString()],
    ["r_current_seq", String(doc.r_current_seq)],
    ["r_total_view", String(doc.r_total_view)],
    ["r_total_mylist", String(doc.r_total_mylist)],
    ["r_total_comment", String(doc.r_total_comment)],
    ["r_ave_view", String(doc.r_ave_view)],
    ["r_ave_mylist", String(doc.r_ave_mylist)],
    ["r_ave_comment", String(doc.r_ave_comment)],
    ["r_ave_view_rank", String(doc.r_ave_view_rank)],
    ["r_ave_mylist_rank", String(doc.r_ave_mylist_rank)],
    ["r_ave_comment_rank", String(doc.r_ave_comment_rank)],
    ["r_diff_view", String(doc.r_diff_view)],
    ["r_diff_mylist", String(doc.r_diff_mylist)],
    ["r_diff_comment", String(doc.r_diff_comment)],
  ]);
  getChlistUrl.search = getChlistParams.toString();
  const chlistRes = await d1fetcher(getChlistUrl.href);
  if (chlistRes == "error") {
    throw new Error("ranking register error");
  }
};

const main = async () => {
  const viewDataT: viewDataType[] = [];
  const videos = await d1Videos();
  if (videos != "error") {
    for (let i = 0; i < videos.length - 1; i++) {
      const video = videos[i];
      console.log("video:", video.ch_seq_title, "ch_id:", video.ch_id);

      const FBviewData = await getFbviewData(video.ch_seq_url);
      if (FBviewData != "error") {
        let viewDataes: viewDataType[] = [];
        for (const FBview of FBviewData) {
          const viewData = makeViewData(video, FBview);
          viewDataes.push(viewData);
        }
        viewDataes = viewDataes.sort(
          (a, b) => a.daddtime.getTime() - b.daddtime.getTime()
        );
        for (let i = 0; i < viewDataes.length; i++) {
          viewDataes[i].diff_view =
            i == 0
              ? viewDataes[i].view_amount
              : viewDataes[i].view_amount - viewDataes[i - 1].view_amount;
          viewDataes[i].diff_mylist =
            i == 0
              ? viewDataes[i].mylist_amount
              : viewDataes[i].mylist_amount - viewDataes[i - 1].mylist_amount;
          viewDataes[i].diff_comment =
            i == 0
              ? viewDataes[i].comment_amount
              : viewDataes[i].comment_amount - viewDataes[i - 1].comment_amount;
        }
        viewDataT.push(...viewDataes);
        for (const viewData of viewDataes) {
          await d1SetViewData(viewData);
        }
        console.log("set");
      }
      // console.log(viewDataT[0]);
      // console.log(new Date(viewDataT[0].daddtime).getTime());
    }
  } else {
    console.log("error");
  }
  const channels = await d1Chlist();
  if (channels != "error") {
    let time = new Date("2024-02-16 00:00:00").getTime();
    const ranking: d1RankingType[] = [];
    while (time < new Date().getTime()) {
      console.log(new Date(time).toLocaleString());
      const dayRanking: d1RankingType[] = [];
      for (let i = 0; i < channels.length - 1; i++) {
        console.log("chlist_id: " + i);
        const channel = channels[i];

        const viewDataArr = viewDataT.filter(
          (viewData) =>
            viewData.ch_id == channel.ch_id &&
            new Date(viewData.daddtime).getTime() <= time + 86400000 &&
            new Date(viewData.daddtime).getTime() >= time
        );
        console.log(channel.ch_title, viewDataArr.length);
        if (viewDataArr.length != 0) {
          let current_seq = 0;
          let total_view = 0;
          let total_mylist = 0;
          let total_comment = 0;
          for (const viewData of viewDataArr) {
            if (viewData.ch_seq > current_seq) {
              current_seq = viewData.ch_seq;
            }
            total_view += viewData.view_amount;
            total_mylist += viewData.mylist_amount;
            total_comment += viewData.comment_amount;
          }
          const ave_view = Math.round(total_view / viewDataArr.length);
          const ave_mylist = Math.round(total_mylist / viewDataArr.length);
          const ave_comment = Math.round(total_comment / viewDataArr.length);
          const latestData = ranking
            .filter((rank) => {
              return (
                rank.ch_id == channel.ch_id && rank.raddtime.getTime() < time
              );
            })
            .sort((a, b) => b.raddtime.getTime() - a.raddtime.getTime());

          dayRanking.push({
            ch_id: channel.ch_id,
            raddtime: viewDataArr[0].daddtime,
            r_current_seq: current_seq,
            r_total_view: total_view,
            r_total_mylist: total_mylist,
            r_total_comment: total_comment,
            r_ave_view: ave_view,
            r_ave_mylist: ave_mylist,
            r_ave_comment: ave_comment,
            r_diff_view:
              latestData.length != 0
                ? total_view - latestData[0].r_total_view
                : total_view,
            r_diff_mylist:
              latestData.length != 0
                ? total_mylist - latestData[0].r_total_mylist
                : total_mylist,
            r_diff_comment:
              latestData.length != 0
                ? total_comment - latestData[0].r_total_comment
                : total_comment,
            r_ave_view_rank: 0,
            r_ave_mylist_rank: 0,
            r_ave_comment_rank: 0,
          });
        }
      }
      const dayViewRank = dayRanking.sort(
        (a, b) => b.r_total_view - a.r_total_view
      );
      const dayMylistRank = dayRanking.sort(
        (a, b) => b.r_total_mylist - a.r_total_mylist
      );
      const dayCommentRank = dayRanking.sort(
        (a, b) => b.r_total_comment - a.r_total_comment
      );
      for (let i = 0; i < dayRanking.length; i++) {
        dayRanking[i].r_ave_view_rank = dayViewRank.findIndex(
          (rank) => rank.ch_id == dayRanking[i].ch_id
        );
        dayRanking[i].r_ave_mylist_rank = dayMylistRank.findIndex(
          (rank) => rank.ch_id == dayRanking[i].ch_id
        );
        dayRanking[i].r_ave_comment_rank = dayCommentRank.findIndex(
          (rank) => rank.ch_id == dayRanking[i].ch_id
        );
      }
      ranking.push(...dayRanking);
      for (const rank of dayRanking) {
        await d1SetRanking(rank);
      }
      time += 86400000;
    }
  }
};

main();
