const stringfySeason = (syear: number, sseason: number) => {
  switch (sseason) {
  case 1:
    return `${syear}-winter`;
  case 2:
    return `${syear}-spring`;
  case 3:
    return `${syear}-summer`;
  case 4:
    return `${syear}-autumn`;
  default:
    throw new Error("sseason is not correct");
  }
};

export default stringfySeason;
