import * as dotenv from "dotenv";
dotenv.config();

const buildFrontEnd = async () => {
  console.log("build FrontEnd");
  const url = process.env.FRONTEND_WEBHOOK;
  if (url === undefined) {
    console.log("FRONTEND_WEBHOOK is not defined");
    return;
  }
  await fetch(url);
};

export default buildFrontEnd;
