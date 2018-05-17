const getAudiencePartitions = state => state.audiencePartitionsTable.audiencePartitionsApi.data;

const getTableDataSource = getAudiencePartitions;

export {
  getTableDataSource,
};
