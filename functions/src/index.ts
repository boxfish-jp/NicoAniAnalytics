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

import { getFirestore } from "firebase-admin/firestore";

import { scheduleTime1 } from "./scheduleTime";
import getChannels from "./getChannels";
import getDetail from "./getDetail";
import chVideos from "./chVideos";
import makeDBData from "./makeData";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

const Nanime = "https://anime.nicovideo.jp/period/now.html";

const db = getFirestore();

export const CheckStreaming = onSchedule(
  { schedule: scheduleTime1, timeoutSeconds: 540 },
  async () => {
    // 実行前の時刻を取得
    const before = new Date().getTime();
    // logger.info("Hello logs!", {structuredData: true});

    // ChList更新用データの取得ここから
    const getChannelsData = await getChannels(Nanime);
    const channeldic = getChannelsData.channelDic;

    const dbConfig = db.collection("dbConfig");
    const dbSeason = (await dbConfig.doc("nowSeason").get()).data();
    if (dbSeason != undefined) {
      if (dbSeason.data != channeldic.season) {
        // シーズンが変わったらnowSeasonを更新
        const document = {
          data: channeldic.season,
        };
        const res = await dbConfig.doc("nowSeason").set(document);
        console.log(res);
      }

      const collectionName = channeldic.season + "-ChList"; // ChListのコレクション名
      // const collectionName = dbSeason.data + "-ChList";

      let lastFetch = getChannelsData.fetchTime;
      let chListLength = 0;
      for (const channel of channeldic.channels) {
        const aniId = channel.NanimeDetail.replace(
          /https:\/\/anime\.nicovideo\.jp\/detail\/(.*?)\/index\.html/,
          "$1"
        );

        const getdbChData = await db
          .collection(collectionName)
          .doc(aniId)
          .get();

        let chUrl = "";
        if (!getdbChData.exists || getdbChData.data()?.chUrl != "") {
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
            const res = await db
              .collection(channeldic.season)
              .doc(video.id)
              .set(video.doc);
            console.log(res);
          });

          const res = await db
            .collection(collectionName)
            .doc(createdData.chDocId)
            .set(createdData.chDoc);
          console.log(res);

          await db
            .collection("dbConfig")
            .doc("LastFetch")
            .update({ data: lastFetch });
          chListLength++;
        }
      }
      // nowSeasonのチャンネル数を更新
      const document = {
        chNum: chListLength,
      };
      const res = await dbConfig.doc("nowSeason").update(document);
      console.log(res);
      // 実行後の時刻を取得
      const after = new Date().getTime();
      // 実行時間を計算
      const executionTime = after - before;
      console.log("実行時間：" + executionTime + "ms");
    }
  }
);
