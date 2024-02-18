import getCh from "../getCh";

export type GetChReturnType = Awaited<ReturnType<typeof getCh>>;
export type ChannelsType = GetChReturnType["channelDic"]["channels"][0];
