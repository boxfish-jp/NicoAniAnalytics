import getChannels from "../getChannels";

export type getChannelsReturnType = Awaited<ReturnType<typeof getChannels>>;
export type ChannelsType = getChannelsReturnType["channelDic"]["channels"][0];
