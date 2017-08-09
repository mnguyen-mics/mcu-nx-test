import numeral from 'numeral';

export const formatMetric = (value, numeralFormat, prefix = '', suffix = '') => {
  if (value !== undefined) {
    return `${prefix}${numeral(value).format(numeralFormat)}${suffix}`;
  }
  return '-';
};

/**
 * Normalize a reportView to an object like the following :
 *
 * {
 *  columns_headers:["campaign_id","impressions","clicks"]
 *  rows: [["1812",4,0],["1814",38258,86]]
 * }
 *
 * TO
 *
 * {
 *  campaign_id: ["1812","1814"]
 *  impressions: [4, 38258]
 *  clicks: [0, 86]
 * }
 *
 * @param {Object} reportView an object comming from performance api
 * @return {Object} normalized object
 */
export const normalizeReportView = (reportView) => {
  const headers = reportView.columns_headers;
  const rows = reportView.rows;
  return rows.map(row => {
    return headers.reduce((acc, header, index) => ({
      ...acc,
      [header]: row[index],
    }), {});
  });
};

/**
 * Format a reportView to an object like the following :
 *
 *  [{
 *    "clicks": 1,
 *    "views": 2
 *  },{
 *    "clicks": 3,
 *    "views": 2
 *  }]
 * }
 *
 * TO
 *
 * {
 *  "clicks" : 4
 *  "clicks" : 4
 * }
 *
 * @param {Object} reportView an object comming from performance api
 * @return {Object} normalized object
 */
export const formatNormalizeReportView = (reportView) => {
  const returnValue = {};
  if (reportView.length > 0) {
    Object.keys(reportView[0]).forEach(key => {
      returnValue[key] = reportView.reduce((a, b) => {
        return a + b[key];
      }, 0);
    });
    return returnValue;
  }
  return returnValue;
};
