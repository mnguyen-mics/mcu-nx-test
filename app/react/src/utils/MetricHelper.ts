import numeral from 'numeral';
import { ReportView } from '../models/ReportView';
import { Index } from '../utils';

export function formatMetric(
  value: any,
  numeralFormat: string,
  prefix: string = '',
  suffix: string = '',
) {
  if (value !== undefined && value !== null && !isNaN(value)) {
    return `${prefix}${numeral(value).format(numeralFormat)}${suffix}`;
  }
  return '-';
}

export function unformatMetric(value: any) {
  return value !== undefined ? parseInt(value.toString().replace(/[.,]/g, ''), 10) : 0;
}

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
 * [
 *  {
 *    campaign_id: "1812",
 *    impressions: 4
 *  },
 *  ...
 * ]
 *
 * @param {Object} reportView an object comming from performance api
 * @return {Object} normalized object
 */
export function normalizeReportView<T = Index<any>>(reportView: ReportView): T[] {
  const headers = reportView.columns_headers;
  const rows = reportView.rows;
  return rows.map(row => {
    return headers.reduce(
      (acc, header, index) => ({
        ...acc,
        [header]: row[index],
      }),
      {},
    );
  }) as T[];
}

/**
 * Format a reportView to an object like the following by summing same key values:
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
 *  "views" : 4
 * }
 *
 * @param {Object} normilizedReportView an object comming from performance api
 * @return {Object} normalized object
 */
export function formatNormalizeReportView(normilizedReportView: Array<Index<any>>) {
  const returnValue: Index<any> = {};
  if (normilizedReportView.length > 0) {
    Object.keys(normilizedReportView[0]).forEach(key => {
      returnValue[key] = normilizedReportView.reduce((a, b) => {
        return a + b[key];
      }, 0);
    });
    return returnValue;
  }
  return returnValue;
}
