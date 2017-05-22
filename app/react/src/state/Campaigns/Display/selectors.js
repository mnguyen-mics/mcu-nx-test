import { createSelector } from 'reselect';

const getCampaignsDisplay = state => state.campaignsDisplayTable.campaignsDisplayApi.data;
const getPerformanceReportRows = state => state.campaignsDisplayTable.performanceReportApi.report_view.rows;
const getPerformanceReportHeaders = state => state.campaignsDisplayTable.performanceReportApi.report_view.columns_headers;

const getCampaignsDisplayById = createSelector(
  getCampaignsDisplay,
  campaignsDisplay => campaignsDisplay.reduce((acc, campaignDisplay) => {
    acc[campaignDisplay.id] = campaignDisplay; // eslint-disable-line no-param-reassign
    return acc;
  }, {})
);

const convertPerformanceReportToObjectArray = createSelector(
  getPerformanceReportHeaders,
  getPerformanceReportRows,
  (headers, rows) => rows.map(row => {
    return headers.reduce((acc, header, index) => {
      acc[header] = row[index]; // eslint-disable-line no-param-reassign
      return acc;
    }, {});
  })
);

const getStatByCampaignId = createSelector(
  convertPerformanceReportToObjectArray,
  (array) => array.reduce((acc, reportObject) => {
    acc[reportObject.campaign_id] = reportObject; // eslint-disable-line no-param-reassign
    return acc;
  }, {})
);

const getTableDataSource = createSelector(
  getCampaignsDisplayById,
  getStatByCampaignId,
  (campaignsDisplay, statistics) => {
    return Object.keys(campaignsDisplay).map((campaignId) => {
      return {
        ...statistics[campaignId],
        ...campaignsDisplay[campaignId]
      };
    });
  }
);

export {
  getTableDataSource
};
