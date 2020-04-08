import XLSX from 'xlsx';
import { defineMessages } from 'react-intl';
import displayCampaignMessages from '../containers/Campaigns/Display/messages.tsx';
import emailCampaignMessages from '../containers/Campaigns/Email/messages.tsx';
import segmentMessages from '../containers/Audience/Segments/Dashboard/messages.ts';
import feedMessages from '../containers/Audience/Feeds/messages.ts';
import dateMessages from '../common/messages/dateMessages.ts';
import exportMessages from '../common/messages/exportMessages.ts';
import log from '../utils/Logger.ts';
import { messages } from '../containers/Settings/DatamartSettings/ServiceUsageReport/List/ServiceUsageReportTable.tsx';
import McsMoment from '../utils/McsMoment.ts';
import emailMessages from '../containers/Campaigns/Email/List/messages.ts';
import goalMessages from '../containers/Campaigns/Goal/Dashboard/messages.ts';
import { formatUnixTimestamp } from '../utils/DateHelper.ts';

const exportServiceMessages = defineMessages({
  from: {
    id: 'service.exportService.from',
    defaultMessage: 'From'
  },
  to: {
    id: 'service.exportService.to',
    defaultMessage: 'to'
  }
});

const datenum = (v, date1904) => {
  let newV = v;
  if (date1904) {
    newV += 1462;
  }
  const epoch = Date.parse(newV);
  return (epoch - new Date(Date.UTC(1899, 11, 30))) / (24 * 60 * 60 * 1000);
};

const s2ab = s => {
  const buf = new ArrayBuffer(s.length);
  const view = new Uint8Array(buf);
  for (let i = 0; i !== s.length; i += 1) {
    view[i] = s.charCodeAt(i) & 0xFF; // eslint-disable-line
  }
  return buf;
};

function buildSheet(title, data, headers, filter, formatMessage, otherInfos) {
  const titleLine = typeof title === 'string' ? [title] : [formatMessage(title)];
  const sheet = [];
  const blankLine = [];
  sheet.push(titleLine);
  if (filter && filter.from && filter.to) sheet.push([`${formatMessage(dateMessages.from)} ${filter.from} ${formatMessage(dateMessages.to)} ${filter.to}`]);
  if (otherInfos) {
    sheet.push([otherInfos.name]);
    sheet.push([otherInfos.id]);
    sheet.push([otherInfos.technical_name]);
  }
  sheet.push(blankLine);
  sheet.push(headers.map(h => h.translation));

  data.forEach(row => {
    const dataLine = headers.map(header => {
      return header.name === 'segment_intersect_with' ? row.segment_intersect_with.id : row[header.name];
    });
    sheet.push(dataLine);
  });

  return sheet;
}

/**
 * @param tabTitle      The title of the tab
 * @param data          Data used to generate the export
 * @param headers       Headers matching the data
 * @param filter        Date filters containing from and to
 * @param formatMessage Internationalization method
 * @param title         [OPTIONAL] Title at the top of the page, if undefined use tabTitle
 * @param otherInfos
 * @returns {*}
 */
function addSheet(tabTitle, data, headers, filter, formatMessage, title, otherInfos) {
  let formattedTabTitle;
  if (typeof tabTitle === 'string') {
    formattedTabTitle = tabTitle.substring(0, 30);
  } else {
    formattedTabTitle = formatMessage(tabTitle).substring(0, 30);
  }
  const sheetTitle = title ? title : tabTitle;
  if (data && data.length) {
    const sheet = buildSheet(sheetTitle, data, headers, filter, formatMessage, otherInfos);
    return {
      name: formattedTabTitle,
      data: sheet
    };
  }
  return undefined;
}

/**
 * Export Specific Methods
 */

class Workbook {
  constructor() {
    this.SheetNames = [];
    this.Sheets = {};
  }
}

const buildWorkbookSheet = data => {
  const ws = {};
  const range = { s: { c: 10000000, r: 10000000 }, e: { c: 0, r: 0 } };
  for (let R = 0; R !== data.length; R += 1) {
    for (let C = 0; C !== data[R].length; C += 1) {
      if (range.s.r > R) {
        range.s.r = R;
      }
      if (range.s.c > C) {
        range.s.c = C;
      }
      if (range.e.r < R) {
        range.e.r = R;
      }
      if (range.e.c < C) {
        range.e.c = C;
      }
      const cell = { v: data[R][C] };
      if (cell.v === null) {
        continue; // eslint-disable-line
      }
      const cell_ref = XLSX.utils.encode_cell({ c: C, r: R }); // eslint-disable-line

      if (typeof cell.v === 'number') {
        cell.t = 'n';
      } else if (typeof cell.v === 'boolean') {
        cell.t = 'b';
      } else if (cell.v instanceof Date) {
        cell.t = 'n';
        cell.z = XLSX.SSF._table[14]; // eslint-disable-line
        cell.v = datenum(cell.v);
      } else {
        cell.t = 's';
      }

      ws[cell_ref] = cell;
    }
  }
  if (range.s.c < 10000000) {
    ws['!ref'] = XLSX.utils.encode_range(range); // eslint-disable-line
  }
  return ws;
};

/**
 * Export data and return a blob (to be used with fileSaver saveAs())
 * @param sheets Array of sheets. Contains sheet names and sheet data.
 * @param fileName File name of the exported file.
 * @param extension Extension of the exported file.
 */
const exportData = (sheets, fileName, extension) => {
  try {
    const newExtension = extension.replace('.', '');
    const workBook = new Workbook();

    for (let i = 0; i < sheets.length; i += 1) {
      let workbookSheet = {};
      workbookSheet = buildWorkbookSheet(sheets[i].data);
      // TODO rewrite export to csv
      // if (newExtension === 'csv') {
      //   workbookSheet = XLSX.utils.sheet_to_csv(workbookSheet); // eslint-disable-line
      //   return new Blob([workbookSheet], { type: 'text/csv;charset=utf-8' }), `${fileName}-${i}.${newExtension}`; // eslint-disable-line
      //   if (i + 1 === sheets.length) {
      //     return;
      //   }
      // } else {
      workBook.SheetNames.push(sheets[i].name);
      workBook.Sheets[sheets[i].name] = workbookSheet;
      // }
    }

    const output = XLSX.write(workBook, { bookType: 'xlsx', bookSST: false, type: 'binary' }); // eslint-disable-line
    saveAs(new Blob([s2ab(output)], { type: 'application/octet-stream' }), `${fileName}.${newExtension}`); // eslint-disable-line
  } catch (error) {
    log.error(error);
  }
};

/**
 * Display Campaigns
 */
const exportDisplayCampaigns = (organisationId, dataSource, filter, formatMessage) => {

  const titleLine = formatMessage(displayCampaignMessages.displayCampaignsExportTitle);
  const blankLine = [];

  const dataSheet = [];

  dataSheet.push(titleLine);
  dataSheet.push([`${formatMessage(exportServiceMessages.from)} ${filter.from.toMoment().format('YYYY-MM-DD')} ${formatMessage(exportServiceMessages.to)} ${filter.to.toMoment().format('YYYY-MM-DD')}`]);
  dataSheet.push(blankLine);

  if (filter.keywords) {
    dataSheet.push(['Search keywords', filter.keywords]);
  }
  if (filter.statuses.length > 0) {
    dataSheet.push(['Displayed statuses', filter.statuses.join(', ')]);
  }

  dataSheet.push(blankLine);

  const headersMap = [
    { name: 'id', translation: formatMessage(displayCampaignMessages.id) },
    { name: 'status', translation: formatMessage(displayCampaignMessages.status) },
    { name: 'name', translation: formatMessage(displayCampaignMessages.name) },
    { name: 'technical_name', translation: formatMessage(displayCampaignMessages.technicalName) },
    { name: 'impressions', translation: formatMessage(displayCampaignMessages.impressions) },
    { name: 'clicks', translation: formatMessage(displayCampaignMessages.clicks) },
    { name: 'cpm', translation: formatMessage(displayCampaignMessages.cpm) },
    { name: 'ctr', translation: formatMessage(displayCampaignMessages.ctr) },
    { name: 'cpc', translation: formatMessage(displayCampaignMessages.cpc) },
    { name: 'impressions_cost', translation: formatMessage(displayCampaignMessages.impressionCost) },
    { name: 'cpa', translation: formatMessage(displayCampaignMessages.cpa) },
  ];

  const headersLine = headersMap.map(header => header.translation);

  dataSheet.push(headersLine);

  dataSource.forEach(row => {
    const dataLine = headersMap.map(header => {
      return row[header.name];
    });
    dataSheet.push(dataLine);
  });

  const sheets = [{
    name: titleLine,
    data: dataSheet,
  }];
  exportData(sheets, `${organisationId}_display-campaigns`, 'xlsx');
};

/**
 * Display Campaign Dashboard
 */
const exportDisplayCampaignDashboard = (organisationId, campaign, campaignData, mediasData, adGroupsData, adsData, goalData, filter, formatMessage) => {

  const campaignPageTitle = `${campaign.name} - ${campaign.id}`;
  const hourlyPrecision = (datenum(filter.to.raw()) - datenum(filter.from.raw())) <= 1;
  const dateHeader = hourlyPrecision ? { name: 'hour_of_day', translation: formatMessage(dateMessages.hour) } : { name: 'day', translation: formatMessage(dateMessages.day) };
  const campaignHeaders = [
    dateHeader,
    { name: 'impressions', translation: formatMessage(displayCampaignMessages.impressions) },
    { name: 'clicks', translation: formatMessage(displayCampaignMessages.clicks) },
    { name: 'cpm', translation: formatMessage(displayCampaignMessages.cpm) },
    { name: 'ctr', translation: formatMessage(displayCampaignMessages.ctr) },
    { name: 'cpc', translation: formatMessage(displayCampaignMessages.cpc) },
    { name: 'impressions_cost', translation: formatMessage(displayCampaignMessages.impressionCost) },
    { name: 'cpa', translation: formatMessage(displayCampaignMessages.cpa) }
  ];

  const mediaHeaders = [
    { name: 'display_network_name', translation: formatMessage(displayCampaignMessages.display_network_name) },
    { name: 'media_id', translation: formatMessage(displayCampaignMessages.name) },
    { name: 'format', translation: formatMessage(displayCampaignMessages.formats) },
    { name: 'impressions', translation: formatMessage(displayCampaignMessages.impressions) },
    { name: 'clicks', translation: formatMessage(displayCampaignMessages.clicks) },
    { name: 'cpm', translation: formatMessage(displayCampaignMessages.cpm) },
    { name: 'ctr', translation: formatMessage(displayCampaignMessages.ctr) },
    { name: 'cpc', translation: formatMessage(displayCampaignMessages.cpc) },
    { name: 'impressions_cost', translation: formatMessage(displayCampaignMessages.impressionCost) },
    { name: 'cpa', translation: formatMessage(displayCampaignMessages.cpa) }
  ];

  const adsAdGroupsHeaders = [
    { name: 'id', translation: formatMessage(displayCampaignMessages.id) },
    { name: 'status', translation: formatMessage(displayCampaignMessages.status) },
    { name: 'name', translation: formatMessage(displayCampaignMessages.name) },
    { name: 'impressions', translation: formatMessage(displayCampaignMessages.impressions) },
    { name: 'clicks', translation: formatMessage(displayCampaignMessages.clicks) },
    { name: 'cpm', translation: formatMessage(displayCampaignMessages.cpm) },
    { name: 'ctr', translation: formatMessage(displayCampaignMessages.ctr) },
    { name: 'cpc', translation: formatMessage(displayCampaignMessages.cpc) },
    { name: 'impressions_cost', translation: formatMessage(displayCampaignMessages.impressionCost) },
    { name: 'cpa', translation: formatMessage(displayCampaignMessages.cpa) }
  ];

  const goalHeaders = [
    dateHeader,
    { name: 'weighted_conversions', translation: formatMessage(displayCampaignMessages.weightedConversion) },
    { name: 'interaction_to_conversion_duration', translation: formatMessage(displayCampaignMessages.interactionToConversionDuration) },
  ];

  const otherInfos = campaign ? campaign : null;
  const title = '';

  const exportFilter = {
    ...filter,
    from: filter.from.toMoment().format('YYYY-MM-DD'),
    to: filter.to.toMoment().format('YYYY-MM-DD'),
  };

  /**
   * Sheet names are not allowing the following special chars: `\`, `/`, `[`, `]`, `?`, `*`
   * @param name The name of a sheet
   */
  const sanitizeSheetNames = (name) => {

    // If a sheet has no name, the excel spreasheet won't work
    // Throw an error
    if (!name) {
      throw new Error("An Excel spreadsheet can't have no name.");
    }

    return name
      .replace(/\\/gm, '')
      .replace(/\//gm, '')
      .replace(/\?/gm, '')
      .replace(/\*/gm, '')
      .replace(/\[/gm, '')
      .replace(/\]/gm, '');

  };

  /**
   * Sheet names are limited to 31 chars.
   *
   * As we're displaying the attribution name at the beginning, we have to ellipsize it.
   *
   * @param name
   */
  const ellispizeAttributionName = (name) => {

    if (!name) {
      return 'undefined';
    }

    if (name.length > 20) {
      return `${name.substring(0, 15)}...`;
    }
    // Else
    return name;

  };

  const buildGoalSheets = () => {
    const goalSheets = [];
    goalData.forEach(goal => {
      goal.attribution.forEach(attribution => {
        goalSheets.push(
          addSheet(sanitizeSheetNames(`${ellispizeAttributionName(attribution.attribution_model_name)} -- ${goal.id} - ${goal.goal_name}`), attribution.perf, goalHeaders, exportFilter, formatMessage, `${goal.goal_name} - ${attribution.attribution_model_name}`, otherInfos)
        );
      });
    });
    return goalSheets;
  };

  const sheets = [
    addSheet(exportMessages.displayCampaignExportTitle, campaignData, campaignHeaders, exportFilter, formatMessage, campaignPageTitle, title, otherInfos),
    addSheet(exportMessages.mediasExportTitle, mediasData, mediaHeaders, exportFilter, formatMessage, title, otherInfos),
    addSheet(exportMessages.adGroupsExportTitle, adGroupsData, adsAdGroupsHeaders, exportFilter, formatMessage, title, otherInfos),
    addSheet(exportMessages.adsExportTitle, adsData, adsAdGroupsHeaders, exportFilter, formatMessage, title, otherInfos),
    ...buildGoalSheets()
  ].filter(x => x);

  if (sheets.length) {
    exportData(sheets, `${organisationId}_display-campaign`, 'xlsx');
  }
};

/**
 * Email Campaigns
 */
const exportEmailCampaigns = (organisationId, dataSource, filter, formatMessage) => {

  const titleLine = formatMessage(emailMessages.emailCampaignsExportTitle);
  const blankLine = [];

  const dataSheet = [];

  dataSheet.push(titleLine);
  dataSheet.push([`${formatMessage(exportServiceMessages.from)} ${filter.from.toMoment().format('YYYY-MM-DD')} ${formatMessage(exportServiceMessages.to)} ${filter.to.toMoment().format('YYYY-MM-DD')}`]);
  dataSheet.push(blankLine);

  if (filter.keywords) {
    dataSheet.push(['Search keywords', filter.keywords]);
  }
  if (filter.statuses.length > 0) {
    dataSheet.push(['Displayed statuses', filter.statuses.join(', ')]);
  }

  dataSheet.push(blankLine);

  const headersMap = [
    { name: 'id', translation: formatMessage(emailMessages.emaiId) },
    { name: 'status', translation: formatMessage(emailMessages.emailHeaderStatus) },
    { name: 'name', translation: formatMessage(emailMessages.emailHeaderName) },
    { name: 'technical_name', translation: formatMessage(emailMessages.emailTechnicalName) },
    { name: 'email_sent', translation: formatMessage(emailMessages.emailHeaderSent) },
    { name: 'email_hard_bounced', translation: formatMessage(emailMessages.emailHeaderHardBounced) },
    { name: 'email_soft_bounced', translation: formatMessage(emailMessages.emailHeaderSoftBounced) },
    { name: 'clicks', translation: formatMessage(emailMessages.emailHeaderClicks) },
    { name: 'impressions', translation: formatMessage(emailMessages.emailHeaderImpressions) },
  ];

  const headersLine = headersMap.map(header => header.translation);

  dataSheet.push(headersLine);

  dataSource.forEach(row => {
    const dataLine = headersMap.map(header => {
      return row[header.name];
    });
    dataSheet.push(dataLine);
  });

  const sheets = [{
    name: titleLine,
    data: dataSheet,
  }];

  exportData(sheets, `${organisationId}_email-campaigns`, 'xlsx');
};

const exportEmailCampaignDashboard = (organisationId, campaign, campaignData, blastData, filter, formatMessage) => {
  const campaignPageTitle = `${campaign.name} - ${campaign.id}`;
  const emailHeaders = [
    { name: 'day', translation: formatMessage(dateMessages.day) },
    { name: 'email_sent', translation: formatMessage(emailCampaignMessages.emailSent) },
    { name: 'email_hard_bounced', translation: formatMessage(emailCampaignMessages.emailHardBounced) },
    { name: 'email_soft_bounced', translation: formatMessage(emailCampaignMessages.emailSoftBounced) },
    { name: 'clicks', translation: formatMessage(emailCampaignMessages.clicks) },
    { name: 'impressions', translation: formatMessage(emailCampaignMessages.impressions) },
    { name: 'email_unsubscribed', translation: formatMessage(emailCampaignMessages.emailUnsubscribed) },
    { name: 'email_complaints', translation: formatMessage(emailCampaignMessages.emailComplaints) },
    { name: 'uniq_impressions', translation: formatMessage(emailCampaignMessages.uniqImpressions) },
    { name: 'uniq_clicks', translation: formatMessage(emailCampaignMessages.uniqClicks) },
    { name: 'uniq_email_sent', translation: formatMessage(emailCampaignMessages.uniqEmailSent) },
    { name: 'uniq_email_unsubscribed', translation: formatMessage(emailCampaignMessages.uniqEmailUnsubscribed) },
    { name: 'uniq_email_hard_bounced', translation: formatMessage(emailCampaignMessages.uniqEmailHardBounced) },
    { name: 'uniq_email_soft_bounced', translation: formatMessage(emailCampaignMessages.uniqEmailSoftBounced) },
    { name: 'uniq_email_complaints', translation: formatMessage(emailCampaignMessages.uniqEmailComplaints) }
  ];

  const emailBlastHeaders = [
    { name: 'id', translation: formatMessage(emailCampaignMessages.id) },
    { name: 'batch_size', translation: formatMessage(emailCampaignMessages.batchSize) },
    { name: 'blast_name', translation: formatMessage(emailCampaignMessages.blastName) },
    { name: 'from_email', translation: formatMessage(emailCampaignMessages.fromEmail) },
    { name: 'from_name', translation: formatMessage(emailCampaignMessages.fromName) },
    { name: 'number_mail_not_send', translation: formatMessage(emailCampaignMessages.numberEmailNotSent) },
    { name: 'reply_to', translation: formatMessage(emailCampaignMessages.replyTo) },
    { name: 'send_date', translation: formatMessage(emailCampaignMessages.sendDate) },
    { name: 'status', translation: formatMessage(emailCampaignMessages.status) },
    { name: 'subject_line', translation: formatMessage(emailCampaignMessages.subjectLine) },
  ];

  const sheets = [
    addSheet(exportMessages.emailCampaignExportTitle, campaignData, emailHeaders, filter, formatMessage, campaignPageTitle),
    addSheet(exportMessages.emailCampaignBlastExportTitle, blastData, emailBlastHeaders, filter, formatMessage)
  ].filter(x => x);

  if (sheets.length) {
    exportData(sheets, `${organisationId}_email-campaign`, 'xlsx');
  }
};

/**
 * Goals
 */
const exportGoals = (organisationId, dataSource, filter, formatMessage) => {

  const titleLine = formatMessage(goalMessages.goalsExportTitle);
  const blankLine = [];

  const dataSheet = [];

  dataSheet.push(titleLine);
  dataSheet.push([`${formatMessage(exportServiceMessages.from)} ${filter.from.toMoment().format('YYYY-MM-DD')} ${formatMessage(exportServiceMessages.to)} ${filter.to.toMoment().format('YYYY-MM-DD')}`]);
  dataSheet.push(blankLine);

  if (filter.keywords) {
    dataSheet.push(['Search keywords', filter.keywords]);
  }
  if (filter.statuses.length > 0) {
    dataSheet.push(['Displayed statuses', filter.statuses.join(', ')]);
  }

  dataSheet.push(blankLine);

  const headersMap = [
    { name: 'name', translation: formatMessage(goalMessages.goalsExportColumnName) },
    { name: 'conversions', translation: formatMessage(goalMessages.goalsExportColumnConversions) },
    { name: 'value', translation: formatMessage(goalMessages.goalsExportColumnConversionValue) },
  ];

  const headersLine = headersMap.map(header => header.translation);

  dataSheet.push(headersLine);

  dataSource.forEach(row => {
    const dataLine = headersMap.map(header => {
      return row[header.name];
    });
    dataSheet.push(dataLine);
  });

  const sheets = [{
    name: titleLine,
    data: dataSheet,
  }];

  exportData(sheets, `${organisationId}_goals`, 'xlsx');
};

const exportGoal = (organisationId, goalData, attributionsData, filter, formatMessage) => {
  const exportFilter = {
    ...filter,
    from: filter.from.toMoment().format('YYYY-MM-DD'),
    to: filter.to.toMoment().format('YYYY-MM-DD'),
  };

  const sanitizeSheetNames = (name) => {
    if (!name) {
      throw new Error("An Excel spreadsheet can't have no name.");
    }

    return name
      .replace(/\\/gm, '')
      .replace(/\//gm, '')
      .replace(/\?/gm, '')
      .replace(/\*/gm, '')
      .replace(/\[/gm, '')
      .replace(/\]/gm, '');
  };

  const headersMap = [
    { name: 'day', translation: formatMessage(goalMessages.day) },
    { name: 'value', translation: formatMessage(goalMessages.value) },
    { name: 'price', translation: formatMessage(goalMessages.price) },
    { name: 'conversions', translation: formatMessage(goalMessages.conversions) },
  ];

  const reportTypeHeaders = {
    SOURCE: [
      { name: 'marketing_channel', translation: formatMessage(goalMessages.marketingChannel) },
      { name: 'source', translation: formatMessage(goalMessages.source) },
      { name: 'interaction_type', translation: formatMessage(goalMessages.interactionType) },
      { name: 'weighted_conversions', translation: formatMessage(goalMessages.weightedConversions) },
      { name: 'weighted_value', translation: formatMessage(goalMessages.weightedValue) },
      { name: 'interaction_to_conversion_duration', translation: formatMessage(goalMessages.interactionToConversionDuration) },
    ],
    CAMPAIGN: [
      { name: 'campaign_id', translation: formatMessage(goalMessages.campaignId) },
      { name: 'campaign_name', translation: formatMessage(goalMessages.campaignName) },
      { name: 'interaction_type', translation: formatMessage(goalMessages.interactionType) },
      { name: 'weighted_conversions', translation: formatMessage(goalMessages.weightedConversions) },
      { name: 'weighted_value', translation: formatMessage(goalMessages.weightedValue) },
      { name: 'interaction_to_conversion_duration', translation: formatMessage(goalMessages.interactionToConversionDuration) },
    ],
    CREATIVE: [
      { name: 'creative_id', translation: formatMessage(goalMessages.creativeId) },
      { name: 'creative_name', translation: formatMessage(goalMessages.creativeName) },
      { name: 'interaction_type', translation: formatMessage(goalMessages.interactionType) },
      { name: 'weighted_conversions', translation: formatMessage(goalMessages.weightedConversions) },
      { name: 'weighted_value', translation: formatMessage(goalMessages.weightedValue) },
      { name: 'interaction_to_conversion_duration', translation: formatMessage(goalMessages.interactionToConversionDuration) },
    ]
  };

  const attributionSheets = attributionsData
    .filter(attributionData => attributionData.normalized_report_view.length > 0)
    .map(attributionData => {
      return addSheet(
        attributionData.attribution_model_id
          .concat('_', sanitizeSheetNames(attributionData.attribution_model_name))
          .concat('_', attributionData.report_type),
        attributionData.normalized_report_view,
        reportTypeHeaders[attributionData.report_type],
        exportFilter,
        formatMessage
      );
    });

  const sheets = [
    addSheet(formatMessage(goalMessages.goalsExportTitle), goalData, headersMap, exportFilter, formatMessage)
  ].concat(attributionSheets);

  exportData(sheets, `${organisationId}_goal`, 'xlsx');
};

/**
 * Audience Segments
 */
const exportAudienceSegments = (organisationId, datamartId, dataSource, filter, formatMessage) => {

  const titleLine = formatMessage(segmentMessages.audienceSegmentsExportTitle);
  const blankLine = [];

  const dataSheet = [];

  dataSheet.push(titleLine);
  dataSheet.push([`${formatMessage(exportServiceMessages.from)} ${new McsMoment('now').toMoment().format('YYYY-MM-DD')} ${formatMessage(exportServiceMessages.to)} ${new McsMoment('now').toMoment().format('YYYY-MM-DD')}`]);
  dataSheet.push(blankLine);

  if (filter.keywords) {
    dataSheet.push(['Search keywords', filter.keywords]);
  }
  if (filter.type.length > 0) {
    dataSheet.push(['Displayed types', filter.type.join(', ')]);
  }

  dataSheet.push(blankLine);

  // TODO use react-inlt
  const headersMap = [
    { name: 'id', translation: 'ID' },
    { name: 'type', translation: formatMessage(segmentMessages.type) },
    { name: 'name', translation: formatMessage(segmentMessages.name) },
    { name: 'technical_name', translation: formatMessage(segmentMessages.technicalName) },
    { name: 'user_points_count', translation: formatMessage(segmentMessages.userPoints) },
    { name: 'user_accounts_count', translation: formatMessage(segmentMessages.userAccounts) },
    { name: 'desktop_cookie_ids_count', translation: formatMessage(segmentMessages.desktopCookieId) },
    { name: 'emails_count', translation: formatMessage(segmentMessages.emails) },
    { name: 'user_point_additions', translation: formatMessage(segmentMessages.addition) },
    { name: 'user_point_deletions', translation: formatMessage(segmentMessages.deletion) },
  ];

  const headersLine = headersMap.map(header => header.translation);

  dataSheet.push(headersLine);

  dataSource.forEach(row => {
    const dataLine = headersMap.map(header => {
      return row[header.name];
    });
    dataSheet.push(dataLine);
  });

  const sheets = [{
    name: titleLine,
    data: dataSheet,
  }];

  exportData(sheets, `${organisationId}_audience-segments`, 'xlsx');
};

/**
 * Audience Segment Dashboard
 */
const exportAudienceSegmentDashboard = (organisationId, datamartId, segmentData, overlapData, filter, formatMessage, segment, audienceSegmentMetrics) => {

  const overviewHeadersMap = (audienceSegmentMetrics || []).reduce((headers, metric) => {
    return {
      ...headers,
      [metric.technical_name]: metric.display_name || metric.technical_name
    };
  }, { user_points: formatMessage(segmentMessages.userPoints) });

  const overviewHeaders = Object.keys(overviewHeadersMap).map(tn => {
    return {
      name: tn,
      translation: overviewHeadersMap[tn]
    };
  });

  const additionDeletionHeaders = [
    { name: 'day', translation: dateMessages.day.defaultMessage },
    { name: 'user_point_additions', translation: formatMessage(segmentMessages.userPointAddition) },
    { name: 'user_point_deletions', translation: formatMessage(segmentMessages.userPointDeletion) }
  ];

  const overlapHeaders = [
    { name: 'xKey', translation: formatMessage(segmentMessages.overlap) },
    { name: 'yKey', translation: formatMessage(segmentMessages.overlapNumber) },
    { name: 'segment_intersect_with', translation: 'id' }
  ];

  const otherInfos = segment ? segment : null;
  const title = '';

  const sheets = [
    addSheet(exportMessages.audienceSegmentOverviewExportTitle, segmentData, overviewHeaders, filter, formatMessage, title, otherInfos),
    addSheet(exportMessages.audienceSegmentAdditionsDeletionsExportTitle, segmentData, additionDeletionHeaders, filter, formatMessage, title, otherInfos),
    addSheet(exportMessages.overlapExportTitle, overlapData, overlapHeaders, filter, formatMessage, title, otherInfos)
  ].filter(x => x);

  if (sheets.length) {
    exportData(sheets, `${organisationId}_${datamartId}_audience-segments`, 'xlsx');
  }
};

/**
* Export Audience Feeds
*/

const exportAudienceFeeds = (datasource, filter, workspace, formatMessage) => {

  const titleLine = formatMessage(feedMessages.audienceFeedsExportTitle);
  const dataSheet = [];

  dataSheet.push([titleLine]);
  dataSheet.push([]);

  dataSheet.push([formatMessage(feedMessages.date), formatUnixTimestamp(Date.now())]);
  dataSheet.push([formatMessage(feedMessages.communityId), workspace.community_id]);
  dataSheet.push([formatMessage(feedMessages.communityName), workspace.organisation_name]);
  dataSheet.push([formatMessage(feedMessages.organisationId), workspace.organisation_id]);
  dataSheet.push([formatMessage(feedMessages.organisationName), workspace.organisation_name]);
  dataSheet.push([]);

  dataSheet.push([formatMessage(feedMessages.filterName), formatMessage(feedMessages.filterValues)]);
  dataSheet.push([formatMessage(feedMessages.connectorType), formatMessage(feedMessages[filter.feedType])]);

  dataSheet.push([formatMessage(feedMessages.connectorName), filter.artifactIds.length !== 0 ? filter.artifactIds.join(', ') : formatMessage(feedMessages.filterAll)]);

  const statusMessages = filter.status.map(status => formatMessage(feedMessages[status])).join(', ');
  dataSheet.push([formatMessage(feedMessages.status), statusMessages.length !== 0 ? statusMessages : formatMessage(feedMessages.filterAll)]);

  dataSheet.push([]);

  const headersMap = [
    { name: 'segment_id', translation: formatMessage(feedMessages.segmentId) },
    { name: 'segment_name', translation: formatMessage(feedMessages.segmentName) },
    { name: 'feed_id', translation: formatMessage(feedMessages.feedId) },
    { name: 'feed_name', translation: formatMessage(feedMessages.feedName) },
    { name: 'connector_type', translation: formatMessage(feedMessages.connectorType) },
    { name: 'connector_name', translation: formatMessage(feedMessages.connectorName) },
    { name: 'status', translation: formatMessage(feedMessages.status) },
  ];

  const headersLine = headersMap.map(header => header.translation);
  dataSheet.push(headersLine);

  datasource.forEach(row => {
    const {
      feed,
      audienceSegment,
    } = row;

    const dataLine = [];

    const audienceSegmmentName = !audienceSegment ? (
      formatMessage(feedMessages.segmentDeleted)
    ) : audienceSegment.name ? (
      audienceSegment.name
    ) : (
      formatMessage(feedMessages.segmentNameNotFound)
    );

    dataLine.push(
      audienceSegment.id,
      audienceSegmmentName,
      feed.id,
      feed.name || '-',
      formatMessage(feedMessages[filter.feedType]),
      feed.artifact_id,
      formatMessage(feedMessages[feed.status])
    );

    dataSheet.push(dataLine);
  });

  const sheets = [{
    name: titleLine,
    data: dataSheet,
  }];

  exportData(sheets, `${workspace.organisation_id}_audience-feeds`, 'xlsx');
};

const exportServiceUsageReportList = (organisationId, data, filter, formatMessage) => {
  const pageTitle = `Service Usage Report List - ${organisationId}`;
  const emailHeaders = [
    { name: 'provider_organisation_id', translation: formatMessage(exportMessages.providerOrganisationId) },
    { name: 'provider_name', translation: formatMessage(messages.providerName) },
    { name: 'campaign_id', translation: formatMessage(exportMessages.campaignId) },
    { name: 'campaign_name', translation: formatMessage(messages.campaignName) },
    { name: 'sub_campaign_id', translation: formatMessage(messages.subCampaignId) },
    { name: 'sub_campaign_name', translation: formatMessage(messages.subCampaignName) },
    { name: 'service_id', translation: formatMessage(exportMessages.serviceId) },
    { name: 'service_name', translation: formatMessage(messages.serviceName) },
    { name: 'service_element_id', translation: formatMessage(exportMessages.serviceElementId) },
    { name: 'segment_name', translation: formatMessage(exportMessages.segmentName) },
    { name: 'unit_count', translation: formatMessage(messages.usage) },
  ];

  const formattedFilter = {
    from: filter.from.toMoment().format('YYYY-MM-DD'),
    to: filter.to.toMoment().format('YYYY-MM-DD'),
  };

  const sheets = [
    addSheet(exportMessages.serviceUsageReportList, data, emailHeaders, formattedFilter, formatMessage, pageTitle)
  ].filter(x => x);

  if (sheets.length) {
    exportData(sheets, `${organisationId}_service-usage-report-list`, 'xlsx');
  }
};

const exportCreativeAdServingSnippet = (organisationId, campaignName, data, formatMessage) => {
  const pageTitle = `Creative Snippets - ${campaignName}`;
  const creativeSnippetHeaders = [
    { name: 'creative_name', translation: formatMessage(displayCampaignMessages.creativeName) },
    { name: 'snippet_code', translation: formatMessage(displayCampaignMessages.snippet) },
  ];

  const sheets = [
    addSheet(exportMessages.creativeName, data, creativeSnippetHeaders, undefined, formatMessage, pageTitle)
  ].filter(x => x);

  if (sheets.length) {
    exportData(sheets, `${organisationId}_${campaignName}-snippets`, 'xlsx');
  }
};

export default {
  exportData,
  exportGoals,
  exportGoal,
  exportEmailCampaigns,
  exportEmailCampaignDashboard,
  exportAudienceSegments,
  exportAudienceFeeds,
  exportDisplayCampaigns,
  exportDisplayCampaignDashboard,
  exportAudienceSegmentDashboard,
  exportServiceUsageReportList,
  exportCreativeAdServingSnippet
};
