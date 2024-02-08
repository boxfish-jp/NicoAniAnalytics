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
import getCh from "./GetCh";
import chVideos from "./chVideos";

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
    const channeldic = await getCh(Nanime);

    if (channeldic.season.endsWith(":error")) {
      return;
    }
    const dbConfig = db.collection("dbConfig");
    const dbSeason = (await dbConfig.doc("nowSeason").get()).data();
    console.log(dbSeason);
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

      const channels = channeldic.channels; // スクレイピングしたチャンネルリスト
      // ChList更新用データの取得ここまで

      // videoごとの更新作業ここから
      let chListLength = 0;
      for (let i = 0; i < channels.length; i++) {
        const videoArr = await chVideos(
          channels[i].chId,
          channels[i].document.NanimeDetail
        ); // スクレイピングした動画データ
        let sumComments = 0;
        let sumMylists = 0;
        let sumViewers = 0;
        videoArr.forEach(async (video) => {
          // 平均を計算
          sumComments += Number(video.doc.NumComment);
          sumMylists += Number(video.doc.mylist);
          sumViewers += Number(video.doc.viewer);

          // videoごとのデータをデータベースに保存
          const document = video.doc;
          const updateMonth = new Date().getMonth();
          const updateDay = new Date().getDate();
          const docId =
            video.id + "-" + String(updateMonth) + "-" + String(updateDay);

          const res = await db
            .collection(channeldic.season)
            .doc(docId)
            .set(document);
          console.log(res);
        });

        // ChListのデータをデータベースに保存
        const aveComments = sumComments
          ? Math.trunc(sumComments / videoArr.length)
          : 0;
        const aveMylists = sumMylists
          ? Math.trunc(sumMylists / videoArr.length)
          : 0;
        const aveViewers = sumViewers
          ? Math.trunc(sumViewers / videoArr.length)
          : 0;

        const videoIds = videoArr.map((video) => video.id);

        if (videoArr.length != 0) {
          const newChId = videoArr[0].doc.chId;
          if (newChId != channels[i].chId) {
            await db.collection(collectionName).doc(channels[i].chId).delete();
          }
          const document = {
            chUrl: "https://ch.nicovideo.jp/" + newChId,
            detail: channels[i].document.detail,
            thumb: channels[i].document.thumb,
            title: channels[i].document.title,
            latestFree: channels[i].document.latestFree,
            premium: channels[i].document.premium,
            aveComments: aveComments,
            aveMylists: aveMylists,
            aveViewers: aveViewers,
            videoIds: videoIds,
          };

          const res = await db
            .collection(collectionName)
            .doc(newChId)
            .set(document);
          console.log(res);
          chListLength++;
        }
      }
      // videoごとの更新作業ここまで

      // nowSeasonのチャンネル数を更新
      const document = {
        chNum: chListLength,
      };
      const res = await dbConfig.doc("nowSeason").update(document);
      console.log(res);
    }
    // 実行後の時刻を取得
    const after = new Date().getTime();
    // 実行時間を計算
    const executionTime = after - before;
    console.log("実行時間：" + executionTime + "ms");
  }
);
