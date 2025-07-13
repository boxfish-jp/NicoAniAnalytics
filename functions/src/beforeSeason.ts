const beforeSeason = (syear: number, sseason: number) => {
  if (sseason === 1) {
    return { syear: syear - 1, sseason: 4 };
  } else {
    return { syear, sseason: sseason - 1 };
  }
};

export default beforeSeason;
