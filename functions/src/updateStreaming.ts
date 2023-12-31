import getSmLvInfo from "./getSmLvInfo";

const updateStreaming = async (
  collectionName: string,
  db: FirebaseFirestore.Firestore
) => {
  const dbConfig = db.collection("dbConfig");
  const spliterData = (await dbConfig.doc("spliter").get()).data();
  const doneData = (await dbConfig.doc("done").get()).data();
  console.log(spliterData);
  console.log(doneData);

  if (spliterData != undefined && doneData != undefined) {
    // const spliter: number = spliterData.data;
    // let done: number = doneData.data;

    const animeListRef = db.collection(collectionName);
    const snapshot = await animeListRef.get();
    const docData: {
      title: string;
      DBVideoInfo: string[];
      DBLiveInfo: string[];
      id: string;
    }[] = [];
    snapshot.forEach((doc) => {
      docData.push({
        title: doc.data().title,
        DBVideoInfo:
          doc.data().videoInfo != undefined ? doc.data().videoInfo : [],
        DBLiveInfo: doc.data().liveInfo != undefined ? doc.data().liveInfo : [],
        id: doc.id,
      });
    });
    console.log("length", docData.length);
    for (let i = 0; i < docData.length; i++) {
      const channelUrl = "https://ch.nicovideo.jp/" + docData[i].id;
      const ScAnimeInfo = await getSmLvInfo(channelUrl);

      const document = {
        videos: [
          ...new Set(docData[i].DBVideoInfo.concat(ScAnimeInfo.videoInfo)),
        ],
        lives: [...new Set(docData[i].DBLiveInfo.concat(ScAnimeInfo.liveInfo))],
      };

      await db.collection(collectionName).doc(docData[i].id).update(document);
    }
  }
};

export default updateStreaming;
