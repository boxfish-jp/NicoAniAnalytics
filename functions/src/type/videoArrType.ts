import chVideos from "../chVideos";

type VideoArrType = Awaited<ReturnType<typeof chVideos>>["videos"];
export default VideoArrType;
