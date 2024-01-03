/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */
import {initializeApp} from "firebase-admin/app";
initializeApp();

// import { onRequest } from "firebase-functions/v2/https";
import {onSchedule} from "firebase-functions/v2/scheduler";

import {getFirestore} from "firebase-admin/firestore";

import getCh from "./GetCh";
import chVideos from "./chVideos";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

const Nanime = "https://anime.nicovideo.jp/period/now.html";

const db = getFirestore();

export const CheckStreaming = onSchedule(
  {schedule: "every day 15:50", timeoutSeconds: 300},
  async () => {
    const before = new Date().getTime();
    // logger.info("Hello logs!", {structuredData: true});

    // ChList DBの初期化
    const channeldic = await getCh(Nanime);

    if (channeldic.season.endsWith(":error")) {
      return;
    }
    const dbConfig = db.collection("dbConfig");
    const dbSeason = (await dbConfig.doc("NowSeason").get()).data();
    console.log(dbSeason);
    if (dbSeason != undefined) {
      if (dbSeason.data != channeldic.season) {
        const document = {
          data: channeldic.season,
        };
        const res = await dbConfig.doc("nowSeason").set(document);
        console.log(res);
      }

      const collectionName = channeldic.season + "-ChList";
      // const collectionName = dbSeason.data + "-ChList";

      const channels = channeldic.channels;

      const dbChList = db.collection(collectionName);
      const getChList = await dbChList.get();

      const addCh = channels.filter((channel) => {
        let flag = true;
        getChList.forEach((doc) => {
          if (channel.chId == String(doc.id)) {
            flag = false;
          }
        });
        return flag;
      });

      for (let i = 0; i < addCh.length; i++) {
        const document = addCh[i].document;

        const res = await db
          .collection(collectionName)
          .doc(addCh[i].chId)
          .set(document);
        console.log(res);
      }
    }
    const after = new Date().getTime();
    console.log((after - before) / 1000);
  }
);

export const updateViewCount = onSchedule(
  {schedule: "every day 16:15", timeoutSeconds: 540},
  async () => {
    const dbConfig = db.collection("dbConfig");
    const checkSeason = (await dbConfig.doc("nowSeason").get()).data();
    const season = checkSeason != undefined ? checkSeason.data : "error";

    if (season != "error") {
      const SeasonCollection = season + "-ChList";
      const channels = await getAllChList(SeasonCollection);

      for (let i = 0; i < channels.length; i++) {
        const videoArr = await chVideos(channels[i]);
        videoArr.forEach(async (video) => {
          const document = video.doc;

          const updateMonth = new Date().getMonth();
          const updateDay = new Date().getDate();
          const docId =
            video.id + "-" + String(updateMonth) + "-" + String(updateDay);
          const res = await db.collection(season).doc(docId).set(document);
          console.log(res);
        });
      }
    }
    console.log("updateViewCount: end");
  }
);

const getAllChList = async (SeasonCollection: string) => {
  const GetDBchannels = await db.collection(SeasonCollection).get();
  const RandChannels = GetDBchannels.docs.map((doc) => doc.id);
  const channels = RandChannels.sort();
  return channels;
};
