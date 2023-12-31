import Image from "next/image";
import db from "@/lib/firebase";

const Home = async () => {
  await datafetch();
  return <h1>Hello World</h1>;
};

const datafetch = async () => {
  const data = await db.collection("dbConfig").doc("NowSeason").get();
  console.log(data);
};

export default Home;
