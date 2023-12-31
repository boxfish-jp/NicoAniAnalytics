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
import * as logger from "firebase-functions/logger";

import {getFirestore} from "firebase-admin/firestore";

import updateStreaming from "./updateStreaming";
import getChannels from "./getChannels";
import videoInfo from "./nicovideo/videoInfo";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

const Nanime = "https://anime.nicovideo.jp/period/now.html";

const db = getFirestore();

export const CheckStreaming = onSchedule(
  {schedule: "every day 00:00", timeoutSeconds: 300},
  async () => {
    const before = new Date().getTime();
    logger.info("Hello logs!", {structuredData: true});

    // ChList DBの初期化
    const channeldic = await getChannels(Nanime);

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

      // const collectionName = channeldic.season + "-ChList";
      const collectionName = dbSeason.data + "-ChList";

      const channels = channeldic.channels;

      const dbChList = db.collection(collectionName);
      const getChList = await dbChList.get();

      const addCh = channels.filter((channel) => {
        let flag = true;
        getChList.forEach((doc) => {
          if (channel.Channelurl == doc.data().Channelurl) {
            flag = false;
          }
        });
        return flag;
      });

      for (let i = 0; i < addCh.length; i++) {
        const document = {
          title: addCh[i].title,
          Channelurl: addCh[i].Channelurl,
        };

        const docname = channels[i].Channelurl.split(
          "https://ch.nicovideo.jp/"
        )[1];

        const res = await db
          .collection(collectionName)
          .doc(docname)
          .set(document);
        console.log(res);
      }

      await updateStreaming(collectionName, db);
    }
    const after = new Date().getTime();
    console.log((after - before) / 1000);
  }
);

export const updateViewCount = onSchedule(
  {schedule: "every 5 minutes", timeoutSeconds: 300},
  async () => {
    const dbConfig = db.collection("dbConfig");
    const checkChannelInfo = (
      await dbConfig.doc("checkChannelId").get()
    ).data();
    const checkSeason = (await dbConfig.doc("NowSeason").get()).data();
    const story =
      checkChannelInfo != undefined ? Number(checkChannelInfo.story) : 0;
    const season = checkSeason != undefined ? checkSeason.data : "error";
    const SeasonCollection = season + "-ChList";
    const channels = await getAllChList(SeasonCollection);
    const channelId =
      checkChannelInfo == undefined || String(checkChannelInfo.id) == "done" ?
        channels[0] :
        String(checkChannelInfo.id);

    const updateDay =
      checkChannelInfo != undefined ? Number(checkChannelInfo.updateDay) : 0;

    if (updateDay == new Date().getDate() && channelId == channels[0]) {
      return;
    }

    const channelSet = db.collection(SeasonCollection).doc(channelId);

    const getChannel = (await channelSet.get()).data();

    const randVideos: string[] =
      getChannel != undefined ? getChannel.videos : [];

    const videos = randVideos.sort();
    const end = videos.length - story > 24 ? story + 23 : videos.length;

    for (let i = Number(story); i < end; i++) {
      const videoId = videos[i].split("https://www.nicovideo.jp/watch/")[1];
      console.log(videoId);
      const updateTime = new Date().getTime();
      const updateMonth = new Date().getMonth();
      const updateDay = new Date().getDate();

      const videoData = await videoInfo(videoId, db);
      const docId =
        videoId + "-" + String(updateMonth) + "-" + String(updateDay);
      let document: {
        title: string;
        description: string;
        viewer: number;
        postDate: Date;
        thumb: string;
        channel: string;
        delete: boolean;
        update: number;
      } = {
        title: videoData.title,
        description: videoData.description,
        viewer: videoData.viewer,
        postDate: videoData.postDate,
        thumb: videoData.thumb,
        channel: channelId,
        delete: false,
        update: updateTime,
      };

      if (videoData.title == "delete") {
        document = {
          title: "",
          description: "",
          viewer: 0,
          postDate: new Date(),
          thumb: "",
          channel: channelId,
          delete: true,
          update: updateTime,
        };
      }

      const res = await db.collection(season).doc(docId).set(document);
      console.log(res);
    }

    const nextStory = (() => {
      if (end == videos.length) {
        return 0;
      } else {
        return Number(end);
      }
    })();

    const nextChannel = (() => {
      if (nextStory != 0) {
        return channelId;
      }

      for (let i = 0; i < channels.length; i++) {
        if (channels[i] == channelId && i + 1 < channels.length) {
          return channels[i + 1];
        }
      }
      return "done";
    })();

    const nextDocument = {
      id: nextChannel,
      story: nextStory,
    };
    await dbConfig.doc("checkChannelId").set(nextDocument);
  }
);

const getAllChList = async (SeasonCollection: string) => {
  const GetDBchannels = await db.collection(SeasonCollection).get();
  const RandChannels = GetDBchannels.docs.map((doc) => doc.id);
  const channels = RandChannels.sort();
  return channels;
};
