import { db } from "./firebase";

const registerDb = async (collectionName: string, aniId: string, data: any) => {
  const res = await db.collection(collectionName).doc(aniId).set(data);
  return res;
};

export default registerDb;
