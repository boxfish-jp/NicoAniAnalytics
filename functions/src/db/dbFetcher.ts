const dbFetcher = async (url: string) => {
  try {
    const data = await fetch(url);
    return data;
  } catch (error) {
    throw new Error(String(error));
  }
};

export default dbFetcher;
