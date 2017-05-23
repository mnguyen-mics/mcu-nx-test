import { createSelector } from 'reselect';

const getCampaignsEmail = state => state.campaignsEmailTable.campaignsEmailApi.data;
const getDeliveryReportRows = state => state.campaignsEmailTable.deliveryReportApi.report_view.rows;
const getDeliveryReportHeaders = state => state.campaignsEmailTable.deliveryReportApi.report_view.columns_headers;

const getCampaignsEmailById = createSelector(
  getCampaignsEmail,
  campaignsEmail => campaignsEmail.reduce((acc, campaignEmail) => {
    acc[campaignEmail.id] = campaignEmail; // eslint-disable-line no-param-reassign
    return acc;
  }, {})
);

const convertDeliveryReportToObjectArray = createSelector(
  getDeliveryReportHeaders,
  getDeliveryReportRows,
  (headers, rows) => rows.map(row => {
    return headers.reduce((acc, header, index) => {
      acc[header] = row[index]; // eslint-disable-line no-param-reassign
      return acc;
    }, {});
  })
);

const getStatByCampaignId = createSelector(
  convertDeliveryReportToObjectArray,
  (array) => array.reduce((acc, reportObject) => {
    acc[reportObject.campaign_id] = reportObject; // eslint-disable-line no-param-reassign
    return acc;
  }, {})
);

const getTableDataSource = createSelector(
  getCampaignsEmailById,
  getStatByCampaignId,
  (campaignsEmail, statistics) => {
    return Object.keys(campaignsEmail).map((campaignId) => {
      return {
        ...statistics[campaignId],
        ...campaignsEmail[campaignId]
      };
    });
  }
);

// const sortCampaignsEmail = campaigns => {
//   const sortByType = (type, a, b) => {
//     return (a[type].toUpperCase() < b[type].toUpperCase()) ? -1 : (a[type].toUpperCase() > b[type].toUpperCase()) ? 1 : 0;
//   };
//   return [...campaigns]
//     .sort((a, b) => sortByType('name', a, b))
//     .sort((a, b) => sortByType('status', a, b));
// };

export {
  getTableDataSource
};
