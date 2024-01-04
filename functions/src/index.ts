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

//import { onRequest } from "firebase-functions/v2/https";
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
    const before = new Date().getTime();
    // logger.info("Hello logs!", {structuredData: true});

    // ChListの更新ここから
    const channeldic = await getCh(Nanime);

    if (channeldic.season.endsWith(":error")) {
      return;
    }
    const dbConfig = db.collection("dbConfig");
    const dbSeason = (await dbConfig.doc("nowSeason").get()).data();
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

      // ChListの更新ここまで

      // videoごとの更新作業ここから
      const channelArr = await getAllChList(channeldic.season);

      for (let i = 0; i < channelArr.length; i++) {
        const videoArr = await chVideos(channelArr[i]);
        videoArr.forEach(async (video) => {
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
      }
      // videoごとの更新作業ここまで
    }

    const mess = await calcAve();
    if (mess == "end") {
      const after = new Date().getTime();
      console.log((after - before) / 1000);
    }
  }
);

const getAllChList = async (SeasonCollection: string) => {
  const GetDBchannels = await db.collection(SeasonCollection).get();
  const RandChannels = GetDBchannels.docs.map((doc) => doc.id);
  const channels = RandChannels.sort();
  return channels;
};

const calcAve = async () => {
  const dbConfig = db.collection("dbConfig");
  const dbSeason = (await dbConfig.doc("nowSeason").get()).data();
  if (dbSeason == undefined) {
    return;
  }
  const season = dbSeason.data;
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const JSTStartOfDay = startOfDay.getTime() - 9 * 60 * 60 * 1000 * 2;
  console.log(JSTStartOfDay);

  const chList = await getAllChList(season + "-ChList");

  const channelLists: {
    chId: string;
    data: { comments: number; mylists: number; viewers: number };
  }[] = [];
  for (let i = 0; i < chList.length; i++) {
    const getVideos = await db
      .collection(season)
      .where("update", ">", JSTStartOfDay)
      .where("chId", "==", chList[i])
      .get();
    let videoCount = 0;
    let comments = 0;
    let mylists = 0;
    let viewers = 0;
    getVideos.forEach((doc) => {
      const data = doc.data();
      console.log("docId:", doc.id);
      comments += Number(data.NumComment);
      mylists += Number(data.mylist);
      viewers += Number(data.viewer);
      videoCount++;
    });
    const aveComments = comments ? Math.trunc(comments / videoCount) : 0;
    const aveMylists = mylists ? Math.trunc(mylists / videoCount) : 0;
    const aveViewers = viewers ? Math.trunc(viewers / videoCount) : 0;

    console.log("chId", chList[i]);
    console.log("aveComments", aveComments);
    console.log("aveMylists", aveMylists);
    console.log("aveViewers", aveViewers);

    const res = await db
      .collection(season + "-ChList")
      .doc(chList[i])
      .update({
        aveComments: aveComments,
        aveMylists: aveMylists,
        aveViewers: aveViewers,
      });
    console.log(res);
  }
  console.log(channelLists);
  return "end";
};
