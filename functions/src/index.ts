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
import main from "./main";
import beforeSeason from "./beforeSeason";
import stringfySeason from "./stringfySeason";
import buildFrontEnd from "./buildFrontEnd";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

const Nanime = "https://anime.nicovideo.jp/period/now.html";
let register = true;

export const CheckStreaming = onRequest(
  {
    timeoutSeconds: 3600,
    cpu: 2,
    region: "asia-northeast1",
  },
  async () => {
    // 実行前の時刻を取得
    const before = new Date().getTime();
    const season = await main(Nanime, register);

    const thisMonth = new Date().getMonth() + 1;

    if (thisMonth == 1 || thisMonth == 4 || thisMonth == 7 || thisMonth == 10) {
      const preSeason = beforeSeason(season.syear, season.sseason);
      const pageName = stringfySeason(preSeason.syear, preSeason.sseason);
      const preSeasonUrl = `https://anime.nicovideo.jp/period/${pageName}.html`;
      await main(preSeasonUrl, register);
    }
    await buildFrontEnd();
    // 実行後の時刻を取得
    const after = new Date().getTime();
    // 実行時間を計算
    const executionTime = after - before;
    console.log("実行時間：" + executionTime + "ms");
  }
);
