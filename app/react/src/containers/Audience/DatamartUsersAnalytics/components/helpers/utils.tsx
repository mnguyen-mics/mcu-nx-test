const supportedDatafarm = new Set([
  'DF_EU_2017_09',
  'DF_EU_2018_10',
  'DF_EU_2018_11',
  'DF_EU_2018_12',
  'DF_EU_2020_02',
  'DF_EU_2020_06',
]);

const isUsersAnalyticsSupportedByDatafarm = (datafarm: string) => {
  return supportedDatafarm.has(datafarm);
};

export { isUsersAnalyticsSupportedByDatafarm }