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
import makeDBData from "./makeData";
import registerDb from "./db/registerDb";
import getDbSeason from "./db/getDbSeason";
import getDbCh from "./db/getDbCh";

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

    const dbSeason = await getDbSeason();
    if (dbSeason != channeldic.season) {
      // シーズンが変わったらnowSeasonを更新
      const document = {
        data: channeldic.season,
      };
      const res = await registerDb("dbConfig", "nowSeason", document);
      console.log(res);
    }

    const collectionName = channeldic.season + "-ChList"; // ChListのコレクション名
    // const collectionName = dbSeason + "-ChList";

    let lastFetch = getChannelsData.fetchTime;
    let chListLength = 0;
    for (const channel of channeldic.channels) {
      const aniId = channel.NanimeDetail.replace(
        /https:\/\/anime\.nicovideo\.jp\/detail\/(.*?)\/index\.html/,
        "$1"
      );

      const getdbChData = await getDbCh(collectionName, aniId);

      let chUrl = "";
      if (getdbChData == undefined || getdbChData?.chUrl != "") {
        const getChannelsUrl = await getDetail(channel.NanimeDetail, lastFetch);
        lastFetch = getChannelsUrl.fetchTime;
        chUrl = getChannelsUrl.chUrl;
      } else {
        chUrl = getdbChData.data()?.chUrl;
      }

      const chId = chUrl.split("https://ch.nicovideo.jp/")[1];
      const getVideoArr = await chVideos(chId, lastFetch);
      const videoArr = getVideoArr.videos;
      lastFetch = getVideoArr.fetchTime;

      const createdData = await makeDBData(channel, chUrl, videoArr);

      if (createdData != undefined) {
        createdData.videos.forEach(async (video) => {
          const res = await registerDb(channeldic.season, video.id, video.doc);
          console.log(res);
        });

        const res = await registerDb(
          collectionName,
          createdData.chDocId,
          createdData.chDoc
        );
        console.log(res);

        await registerDb("dbConfig", "LastFetch", { data: lastFetch });
        chListLength++;
      }
    }
    // nowSeasonのチャンネル数を更新
    const document = {
      chNum: chListLength,
    };
    const res = await registerDb("dbConfig", "nowSeason", document);
    console.log(res);
    // 実行後の時刻を取得
    const after = new Date().getTime();
    // 実行時間を計算
    const executionTime = after - before;
    console.log("実行時間：" + executionTime + "ms");
  }
);
