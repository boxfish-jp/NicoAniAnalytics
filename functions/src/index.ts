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

import { onRequest } from "firebase-functions/v2/https";
// import { onSchedule } from "firebase-functions/v2/scheduler";

// import { scheduleTime1 } from "./scheduleTime";
import getChannels from "./getChannels";
import getDetail from "./getDetail";
import chVideos from "./chVideos";
import { getDbSeason, createSeason } from "./db/season";
import { getDbChlistFromSeason, createChlist } from "./db/chlist";
import { createVideos, getDbVideosFromSeason } from "./db/videos";
import { createViewData, getViewDatafromSeason } from "./db/viewData";
import { createRanking, getDbRankingFromSeason } from "./db/ranking";
import getAnnict from "./annict/getAnnict";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

const Nanime = "https://anime.nicovideo.jp/period/now.html";

export const CheckStreaming = onRequest(
  {
    timeoutSeconds: 3600,
    cpu: 2,
    region: "asia-northeast1",
  },
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

    const completeChlist: {
      ch_id: number;
      ch_NaniTag: string;
      ch_title: string;
      ch_url: string;
      ch_detail: string;
      ch_latestFree: number;
      ch_premium: number;
      ch_year: number;
      ch_season: number;
      ch_twitter: string;
      ch_siteUrl: string;
      ch_thumb: string;
    }[] = [];

    const completeVideos: {
      ch_id: number;
      ch_seq: number;
      ch_seq_id: number;
      ch_seq_url: string;
      ch_seq_title: string;
      ch_seq_thumb: string;
      ch_seq_desc: string;
      ch_seq_posted: Date;
    }[] = [];

    const completeViewData: {
      ch_id: number;
      ch_seq: number;
      ch_seq_id: number;
      view_amount: number;
      comment_amount: number;
      mylist_amount: number;
      diff_view: number;
      diff_comment: number;
      diff_mylist: number;
    }[] = [];

    const DBchannels = await getDbChlistFromSeason(
      channeldic.season.syear,
      channeldic.season.sseason
    );

    const DbVideos = await getDbVideosFromSeason(
      channeldic.season.syear,
      channeldic.season.sseason
    );

    const DbViewData = await getViewDatafromSeason(
      channeldic.season.syear,
      channeldic.season.sseason,
      new Date()
    );

    let lastFetch = getChannelsData.fetchTime;
    // let chListLength = 0;
    for (const channel of channeldic.channels) {
      // chlistの更新ここから
      console.log("now:", channel.NaniTag);
      const check = DBchannels.find(
        (value) => value.ch_NaniTag == channel.NaniTag
      );

      let chUrl = "";
      if (check == undefined || check.ch_url == "") {
        const getChannelsUrl = await getDetail(channel.NanimeDetail, lastFetch);
        lastFetch = getChannelsUrl.fetchTime;
        chUrl = getChannelsUrl.chUrl;
      } else {
        chUrl = check.ch_url;
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
      for (const video of videoArr) {
        // videosのDB登録作業
        completeVideos.push({
          ch_id: video.video.ch_id,
          ch_seq: video.video.ch_seq,
          ch_seq_id: video.video.ch_seq_id,
          ch_seq_url: video.video.ch_seq_url,
          ch_seq_title: video.video.ch_seq_title,
          ch_seq_thumb: video.video.ch_seq_thumb,
          ch_seq_desc: video.video.ch_seq_desc,
          ch_seq_posted: video.video.ch_seq_posted,
        });
        // videosのDB登録作業

        // viewDataのDB登録作業
        const getDbLatestViewData = DbViewData.find(
          (valus) => valus.ch_seq_id == video.video.ch_seq_id
        );
        const lastViewData = {
          view_amount:
            getDbLatestViewData != undefined
              ? getDbLatestViewData.view_amount
              : 0,
          comment_amount:
            getDbLatestViewData != undefined
              ? getDbLatestViewData.comment_amount
              : 0,
          mylist_amount:
            getDbLatestViewData != undefined
              ? getDbLatestViewData.mylist_amount
              : 0,
        };
        completeViewData.push({
          ch_id: video.video.ch_id,
          ch_seq: video.video.ch_seq,
          ch_seq_id: video.video.ch_seq_id,
          view_amount: video.viewData.viewer,
          comment_amount: video.viewData.NumComment,
          mylist_amount: video.viewData.mylist,
          diff_view: video.viewData.viewer - lastViewData.view_amount,
          diff_comment: video.viewData.NumComment - lastViewData.comment_amount,
          diff_mylist: video.viewData.mylist - lastViewData.mylist_amount,
        });
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
        await new Promise((resolve) => setTimeout(resolve, 100));
        // viewDataのDB登録作業
      }

      completeChlist.push({
        ch_id: videoArr[0].video.ch_id,
        ch_NaniTag: channel.NaniTag,
        ch_title: channel.title,
        ch_url: chUrl,
        ch_detail: channel.detail,
        ch_latestFree: channel.latestFree ? 1 : 0,
        ch_premium: channel.premium ? 1 : 0,
        ch_year: channeldic.season.syear,
        ch_season: channeldic.season.sseason,
        ch_twitter: chsiteInfo.twitter,
        ch_siteUrl: chsiteInfo.siteUrl,
        ch_thumb: channel.thumb,
      });

      // await registerDb("dbConfig", "LastFetch", { data: lastFetch });
      // chListLength++;
    }

    if (completeChlist.length > DBchannels.length) {
      for (const value of completeChlist) {
        const check = DBchannels.find((val) => val.ch_id == value.ch_id);
        if (check == undefined) {
          await createChlist(
            value.ch_id,
            value.ch_NaniTag,
            value.ch_title,
            value.ch_url,
            value.ch_detail,
            value.ch_latestFree,
            value.ch_premium,
            value.ch_year,
            value.ch_season,
            value.ch_twitter,
            value.ch_siteUrl,
            value.ch_thumb
          );
          // 0.1秒待機
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }
    }

    if (completeVideos.length > DbVideos.length) {
      for (const value of completeVideos) {
        const check = DbVideos.find((val) => val.ch_seq_id == value.ch_seq_id);
        if (check == undefined) {
          await createVideos(
            value.ch_id,
            value.ch_seq,
            value.ch_seq_url,
            value.ch_seq_id,
            value.ch_seq_title,
            value.ch_seq_thumb,
            value.ch_seq_desc,
            value.ch_seq_posted
          );
          // 0.1秒待機
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }
    }

    // rankingの更新処理
    const rankingChlist: {
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
    const latestRankingChlist = await getDbRankingFromSeason(
      channeldic.season.syear,
      channeldic.season.sseason,
      new Date()
    );
    for (const channel of completeChlist) {
      console.log("now:", channel.ch_NaniTag);
      const viewDataes = completeViewData.filter(
        (value) => value.ch_id == channel.ch_id
      );
      let total_View = 0;
      let total_comment = 0;
      let total_mylist = 0;
      let current_seq = 0;
      for (const viewData of viewDataes) {
        total_View += viewData.view_amount;
        total_comment += viewData.comment_amount;
        total_mylist += viewData.mylist_amount;
        if (current_seq < viewData.ch_seq) {
          current_seq = viewData.ch_seq;
        }
      }
      const lastRanking = latestRankingChlist.find(
        (value) => value.ch_id == channel.ch_id
      );
      rankingChlist.push({
        ch_id: channel.ch_id,
        r_current_seq: current_seq,
        r_total_view: total_View,
        r_total_comment: total_comment,
        r_total_mylist: total_mylist,
        r_ave_view: Math.round(total_View / viewDataes.length),
        r_ave_comment: Math.round(total_comment / viewDataes.length),
        r_ave_mylist: Math.round(total_mylist / viewDataes.length),
        r_ave_view_rank: 0,
        r_ave_comment_rank: 0,
        r_ave_mylist_rank: 0,
        r_diff_view:
          lastRanking != undefined
            ? total_View - lastRanking.r_total_view
            : total_View,
        r_diff_comment:
          lastRanking != undefined
            ? total_comment - lastRanking.r_total_comment
            : total_comment,
        r_diff_mylist:
          lastRanking != undefined
            ? total_mylist - lastRanking.r_total_mylist
            : total_mylist,
      });
    }

    const sortView = [...rankingChlist].sort((a, b) => {
      return b.r_ave_view - a.r_ave_view;
    });
    const sortComment = [...rankingChlist].sort((a, b) => {
      return b.r_ave_comment - a.r_ave_comment;
    });
    const sortMylist = [...rankingChlist].sort((a, b) => {
      return b.r_ave_mylist - a.r_ave_mylist;
    });
    for (let i = 0; i < rankingChlist.length; i++) {
      rankingChlist[i].r_ave_view_rank =
        sortView.findIndex((value) => value.ch_id == rankingChlist[i].ch_id) +
        1;
      rankingChlist[i].r_ave_comment_rank =
        sortComment.findIndex(
          (value) => value.ch_id == rankingChlist[i].ch_id
        ) + 1;
      rankingChlist[i].r_ave_mylist_rank =
        sortMylist.findIndex((value) => value.ch_id == rankingChlist[i].ch_id) +
        1;
      await createRanking(
        rankingChlist[i].ch_id,
        rankingChlist[i].r_current_seq,
        rankingChlist[i].r_total_view,
        rankingChlist[i].r_total_comment,
        rankingChlist[i].r_total_mylist,
        rankingChlist[i].r_ave_view,
        rankingChlist[i].r_ave_comment,
        rankingChlist[i].r_ave_mylist,
        rankingChlist[i].r_ave_view_rank,
        rankingChlist[i].r_ave_comment_rank,
        rankingChlist[i].r_ave_mylist_rank,
        rankingChlist[i].r_diff_view,
        rankingChlist[i].r_diff_comment,
        rankingChlist[i].r_diff_mylist
      );
      // 0.1秒待機
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    // rankingの更新処理

    // 実行後の時刻を取得
    const after = new Date().getTime();
    // 実行時間を計算
    const executionTime = after - before;
    console.log("実行時間：" + executionTime + "ms");
  }
);
