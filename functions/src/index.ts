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
import { getDbChlistFromTag, createChlist } from "./db/chlist";
import { createVideos, getDbVideosFromId } from "./db/videos";
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
    let siteUrl = "";
    if (getdbChData.length == 0 || getdbChData[0].ch_url == "") {
      const getChannelsUrl = await getDetail(channel.NanimeDetail, lastFetch);
      lastFetch = getChannelsUrl.fetchTime;
      chUrl = getChannelsUrl.chUrl;
      siteUrl = getChannelsUrl.siteUrl;
    } else {
      chUrl = getdbChData[0].ch_url;
      siteUrl = getdbChData[0].ch_site;
    }
    if (chUrl == "") {
      continue;
    }
    // const chsiteInfo = await getAnnict(channel.title);
    // chlistの更新ここまで

    const getVideoArr = await chVideos(chUrl, lastFetch);
    const videoArr = getVideoArr.videos;
    lastFetch = getVideoArr.fetchTime;
    if (videoArr.length == 0) {
      continue;
    }
    videoArr.forEach(async (video) => {
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
        "undefined",
        siteUrl,
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
};

test();
