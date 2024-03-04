/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */
import { initializeApp } from "firebase-admin/app";
initializeApp();

// import { onRequest } from "firebase-functions/v2/https";
import { onSchedule } from "firebase-functions/v2/scheduler";

import { scheduleTime1 } from "./scheduleTime";
import getChannels from "./getChannels";
import getDetail from "./getDetail";
import chVideos from "./chVideos";
import { getDbSeason, createSeason } from "./db/season";
import {
  getDbChlistFromTag,
  getDbChlistFromSeason,
  createChlist,
} from "./db/chlist";
import {
  createVideos,
  getDbVideosFromCh,
  getDbVideosFromId,
} from "./db/videos";
import { getViewDatafromTime, createViewData } from "./db/viewData";
import { getRanking, createRanking } from "./db/ranking";
import getAnnict from "./annict/getAnnict";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

const Nanime = "https://anime.nicovideo.jp/period/now.html";

export const CheckStreaming = onSchedule(
  { schedule: scheduleTime1, timeoutSeconds: 540 },
  async () => {
    // 実行前の時刻を取得
    const before = new Date().getTime();
    // logger.info("Hello logs!", {structuredData: true});

    // ChList更新用データの取得ここから
    const getChannelsData = await getChannels(Nanime);
    const channeldic = getChannelsData.channelDic;

    const dbSeason = await getDbSeason(
      channeldic.season.syear,
      channeldic.season.sseason
    );
    if (dbSeason.length == 0) {
      await createSeason(channeldic.season.syear, channeldic.season.sseason);
    }

    let lastFetch = getChannelsData.fetchTime;
    //let chListLength = 0;
    for (const channel of channeldic.channels) {
      // chlistの更新ここから
      const NaniTag = channel.NanimeDetail.replace(
        /https:\/\/anime\.nicovideo\.jp\/detail\/(.*?)\/index\.html/,
        "$1"
      );

      const getdbChData = await getDbChlistFromTag(NaniTag);

      let chUrl = "";
      if (getdbChData.length == 0 || getdbChData[0].ch_url == "") {
        const getChannelsUrl = await getDetail(channel.NanimeDetail, lastFetch);
        lastFetch = getChannelsUrl.fetchTime;
        chUrl = getChannelsUrl.chUrl;
      } else {
        chUrl = getdbChData[0].ch_url;
      }
      if (chUrl == "") {
        continue;
      }
      const chsiteInfo = await getAnnict(channel.title);
      // chlistの更新ここまで

      const getVideoArr = await chVideos(chUrl, lastFetch);
      const videoArr = getVideoArr.videos;
      lastFetch = getVideoArr.fetchTime;
      if (videoArr.length == 0) {
        continue;
      }
      videoArr.forEach(async (video) => {
        // videosのDB登録作業
        const res = await getDbVideosFromId(video.video.ch_seq_id);
        if (res.length == 0) {
          await createVideos(
            video.video.ch_id,
            video.video.ch_seq,
            video.video.ch_seq_url,
            video.video.ch_seq_id,
            video.video.ch_seq_title,
            video.video.ch_seq_thumb,
            video.video.ch_seq_desc,
            video.video.ch_seq_posted
          );
        }
        // videosのDB登録作業

        // viewDataのDB登録作業
        const getDbLatestViewData = await getViewDatafromTime(
          video.video.ch_seq_id,
          new Date()
        );
        const lastViewData = {
          view_amount:
            getDbLatestViewData.length != 0
              ? getDbLatestViewData[0].view_amount
              : 0,
          comment_amount:
            getDbLatestViewData.length != 0
              ? getDbLatestViewData[0].comment_amount
              : 0,
          mylist_amount:
            getDbLatestViewData.length != 0
              ? getDbLatestViewData[0].mylist_amount
              : 0,
        };
        await createViewData(
          video.video.ch_id,
          video.video.ch_seq,
          video.video.ch_seq_id,
          video.viewData.viewer,
          video.viewData.NumComment,
          video.viewData.mylist,
          video.viewData.viewer - lastViewData.view_amount,
          video.viewData.NumComment - lastViewData.comment_amount,
          video.viewData.mylist - lastViewData.mylist_amount
        );
        // viewDataのDB登録作業
      });

      if (getdbChData.length == 0) {
        await createChlist(
          videoArr[0].video.ch_id,
          NaniTag,
          channel.title,
          chUrl,
          channel.detail,
          channel.latestFree ? 1 : 0,
          channel.premium ? 1 : 0,
          channeldic.season.syear,
          channeldic.season.sseason,
          chsiteInfo.twitter,
          chsiteInfo.siteUrl,
          channel.thumb
        );
      }

      //await registerDb("dbConfig", "LastFetch", { data: lastFetch });
      //chListLength++;
    }
    // 実行後の時刻を取得
    const after = new Date().getTime();
    // 実行時間を計算
    const executionTime = after - before;
    console.log("実行時間：" + executionTime + "ms");
  }
);

const test = async () => {
  // 実行前の時刻を取得
  const before = new Date().getTime();
  // logger.info("Hello logs!", {structuredData: true});

  // ChList更新用データの取得ここから
  const getChannelsData = await getChannels(Nanime);
  const channeldic = getChannelsData.channelDic;

  const dbSeason = await getDbSeason(
    channeldic.season.syear,
    channeldic.season.sseason
  );
  if (dbSeason.length == 0) {
    await createSeason(channeldic.season.syear, channeldic.season.sseason);
  }

  let lastFetch = getChannelsData.fetchTime;
  //let chListLength = 0;
  for (const channel of channeldic.channels) {
    // chlistの更新ここから
    const NaniTag = channel.NanimeDetail.replace(
      /https:\/\/anime\.nicovideo\.jp\/detail\/(.*?)\/index\.html/,
      "$1"
    );

    const getdbChData = await getDbChlistFromTag(NaniTag);

    let chUrl = "";
    if (getdbChData.length == 0 || getdbChData[0].ch_url == "") {
      const getChannelsUrl = await getDetail(channel.NanimeDetail, lastFetch);
      lastFetch = getChannelsUrl.fetchTime;
      chUrl = getChannelsUrl.chUrl;
    } else {
      chUrl = getdbChData[0].ch_url;
    }
    if (chUrl == "") {
      continue;
    }
    const chsiteInfo = await getAnnict(channel.title);
    // chlistの更新ここまで

    const getVideoArr = await chVideos(chUrl, lastFetch);
    const videoArr = getVideoArr.videos;
    lastFetch = getVideoArr.fetchTime;
    if (videoArr.length == 0) {
      continue;
    }
    videoArr.forEach(async (video) => {
      // videosのDB登録作業
      const res = await getDbVideosFromId(video.video.ch_seq_id);
      if (res.length == 0) {
        await createVideos(
          video.video.ch_id,
          video.video.ch_seq,
          video.video.ch_seq_url,
          video.video.ch_seq_id,
          video.video.ch_seq_title,
          video.video.ch_seq_thumb,
          video.video.ch_seq_desc,
          video.video.ch_seq_posted
        );
      }
      // videosのDB登録作業

      // viewDataのDB登録作業
      const getDbLatestViewData = await getViewDatafromTime(
        video.video.ch_seq_id,
        new Date()
      );
      const lastViewData = {
        view_amount:
          getDbLatestViewData.length != 0
            ? getDbLatestViewData[0].view_amount
            : 0,
        comment_amount:
          getDbLatestViewData.length != 0
            ? getDbLatestViewData[0].comment_amount
            : 0,
        mylist_amount:
          getDbLatestViewData.length != 0
            ? getDbLatestViewData[0].mylist_amount
            : 0,
      };
      await createViewData(
        video.video.ch_id,
        video.video.ch_seq,
        video.video.ch_seq_id,
        video.viewData.viewer,
        video.viewData.NumComment,
        video.viewData.mylist,
        video.viewData.viewer - lastViewData.view_amount,
        video.viewData.NumComment - lastViewData.comment_amount,
        video.viewData.mylist - lastViewData.mylist_amount
      );
    });

    if (getdbChData.length == 0) {
      await createChlist(
        videoArr[0].video.ch_id,
        NaniTag,
        channel.title,
        chUrl,
        channel.detail,
        channel.latestFree ? 1 : 0,
        channel.premium ? 1 : 0,
        channeldic.season.syear,
        channeldic.season.sseason,
        chsiteInfo.twitter,
        chsiteInfo.siteUrl,
        channel.thumb
      );
    }

    //await registerDb("dbConfig", "LastFetch", { data: lastFetch });
    //chListLength++;
  }

  const chlists = await getDbChlistFromSeason(2024, 1);

  const chdata: {
    ch_id: number;
    r_current_seq: number;
    r_total_view: number;
    r_total_comment: number;
    r_total_mylist: number;
    r_ave_view: number;
    r_ave_comment: number;
    r_ave_mylist: number;
    r_ave_view_rank: number;
    r_ave_comment_rank: number;
    r_ave_mylist_rank: number;
    r_diff_view: number;
    r_diff_comment: number;
    r_diff_mylist: number;
  }[] = [];
  for (const channel of chlists) {
    const videos = await getDbVideosFromCh(channel.ch_id);

    let total_View = 0;
    let total_comment = 0;
    let total_mylist = 0;
    let current_seq = 0;
    for (const video of videos) {
      const viewData = await getViewDatafromTime(video.ch_seq_id, new Date());
      for (const view of viewData) {
        total_View += view.view_amount;
        total_comment += view.comment_amount;
        total_mylist += view.mylist_amount;
      }
      if (current_seq < video.ch_seq) {
        current_seq = video.ch_seq;
      }
    }

    const lastRanking = await getRanking(channel.ch_id, new Date());

    chdata.push({
      ch_id: channel.ch_id,
      r_current_seq: current_seq,
      r_total_view: total_View,
      r_total_comment: total_comment,
      r_total_mylist: total_mylist,
      r_ave_view: Math.round(total_View / videos.length),
      r_ave_comment: Math.round(total_comment / videos.length),
      r_ave_mylist: Math.round(total_mylist / videos.length),
      r_ave_view_rank: 0,
      r_ave_comment_rank: 0,
      r_ave_mylist_rank: 0,
      r_diff_view:
        lastRanking.length != 0
          ? total_View - lastRanking[0].r_total_view
          : total_View,
      r_diff_comment:
        lastRanking.length != 0
          ? total_comment - lastRanking[0].r_total_comment
          : total_comment,
      r_diff_mylist:
        lastRanking.length != 0
          ? total_mylist - lastRanking[0].r_total_mylist
          : total_mylist,
    });
  }

  const sortView = [...chdata].sort((a, b) => {
    return b.r_ave_view - a.r_ave_view;
  });
  const sortComment = [...chdata].sort((a, b) => {
    return b.r_ave_comment - a.r_ave_comment;
  });
  const sortMylist = [...chdata].sort((a, b) => {
    return b.r_ave_mylist - a.r_ave_mylist;
  });

  for (let i = 0; i < chdata.length; i++) {
    chdata[i].r_ave_view_rank =
      sortView.findIndex((value) => value.ch_id == chdata[i].ch_id) + 1;
    chdata[i].r_ave_comment_rank =
      sortComment.findIndex((value) => value.ch_id == chdata[i].ch_id) + 1;
    chdata[i].r_ave_mylist_rank =
      sortMylist.findIndex((value) => value.ch_id == chdata[i].ch_id) + 1;
  }

  chdata.forEach(async (data) => {
    await createRanking(
      data.ch_id,
      data.r_current_seq,
      data.r_total_view,
      data.r_total_comment,
      data.r_total_mylist,
      data.r_ave_view,
      data.r_ave_comment,
      data.r_ave_mylist,
      data.r_ave_view_rank,
      data.r_ave_comment_rank,
      data.r_ave_mylist_rank,
      data.r_diff_view,
      data.r_diff_comment,
      data.r_diff_mylist
    );
  });

  // 実行後の時刻を取得
  const after = new Date().getTime();
  // 実行時間を計算
  const executionTime = after - before;
  console.log("実行時間：" + executionTime + "ms");
};

test();
