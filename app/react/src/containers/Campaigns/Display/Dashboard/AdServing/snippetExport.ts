import { split } from 'lodash';
import {
  AdInfoResource,
  DisplayCampaignInfoResource,
} from '../../../../../models/campaign/display';
import ExportService from '../../../../../services/ExportService';
import { MessageValue, FormattedMessage } from 'react-intl';

// tslint:disable-next-line no-invalid-template-strings
const GOOGLE_DFP_CLICK_MACRO = '%%CLICK_URL_ESC%%';
// tslint:disable-next-line no-invalid-template-strings
const GOOGLE_DBM_CLICK_MACRO = '${CLICK_URL_ENC}';
// tslint:disable-next-line no-invalid-template-strings
const APX_CLICK_MACRO = '${CLICK_URL_ENC}';
// tslint:disable-next-line no-invalid-template-strings
const SMART_CLICK_MACRO = '[countgo]';
const NONE_MACRO = '/*INSERT HERE YOUR CLICK TRACKING URL*/';

export type ExportType = 'GOOGLE_DFP' | 'GOOGLE_DBM' | 'APX' | 'SMART' | 'NONE';

export function generateCsvData(
  organsationId: string,
  campaign: DisplayCampaignInfoResource,
  macro: ExportType,
  ads: AdInfoResource[],
  formatMessage: (
    messageDescriptor: FormattedMessage.MessageDescriptor,
    values?: { [key: string]: MessageValue },
  ) => string,
) {
  const data = ads.map(ad => {
    const format = split(ad.format, 'x');
    const adGroupId = campaign.ad_groups.find(adg =>
      adg.ads.find(a => a.id === ad.id) ? true : false,
    )!.id;
    return {
      creative_name: ad.name,
      snippet_code: generateSnippet(
        ad.creative_id,
        Number(format[0]),
        Number(format[1]),
        macro,
        campaign.id,
        adGroupId,
      ),
    };
  });
  ExportService.exportCreativeAdServingSnippet(organsationId, campaign.name, data, formatMessage);
}

function generateMacro(macro: ExportType) {
  switch (macro) {
    case 'GOOGLE_DFP':
      return GOOGLE_DFP_CLICK_MACRO;
    case 'GOOGLE_DBM':
      return GOOGLE_DBM_CLICK_MACRO;
    case 'APX':
      return APX_CLICK_MACRO;
    case 'SMART':
      return SMART_CLICK_MACRO;
    default:
      return NONE_MACRO;
  }
}

function generateSnippet(
  creativeId: string,
  width: number,
  height: number,
  type: ExportType,
  campaignId: string,
  adGroupId: string,
) {
  return `<iframe src="https://ads.mediarithmics.com/ads/render?ctx=LIVE&rid=${creativeId}&clktr=${generateMacro(
    type,
  )}&cid=${campaignId}&gid=${adGroupId}" width="${width}" height="${height}" frameborder="0" scrolling="no"></iframe>`;
}
