import { db } from "./firebase";

const getDbCh = async (collectionName: string, aniId: string) => {
  const getdbChData = await db.collection(collectionName).doc(aniId).get();
  if (getdbChData.exists) {
    return getdbChData.data();
  } else {
    return undefined;
  }
};

export default getDbCh;
