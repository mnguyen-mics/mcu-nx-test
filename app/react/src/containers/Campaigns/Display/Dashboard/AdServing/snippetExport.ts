import { split } from 'lodash';
import { AdInfoResource } from "../../../../../models/campaign/display";
import ExportService from "../../../../../services/ExportService";
import { MessageValue, FormattedMessage } from 'react-intl';

// tslint:disable-next-line no-invalid-template-strings 
const GOOGLE_CLICK_MACRO = "${CLICK_URL}";
// tslint:disable-next-line no-invalid-template-strings 
const APX_CLICK_MACRO = "${CLICK_URL}";
const NONE_MACRO = "/*INSERT HERE YOUR CLICK TRACKING URL*/"

export type ExportType = 'GOOGLE' | 'APX' | 'NONE'

export function generateCsvData(organsationId: string, campaignName: string, macro: ExportType, ads: AdInfoResource[], formatMessage: (messageDescriptor: FormattedMessage.MessageDescriptor, values?: {[key: string]: MessageValue}) => string) {
  const data = ads.map(ad => {
    const format = split(ad.format, 'x');
    return {
      creative_name: ad.name,
      snippet_code: generateSnippet(ad.id, Number(format[0]), Number(format[1]), macro)
    }
  })
  ExportService.exportCreativeAdServingSnippet(
    organsationId,
    campaignName,
    data,
    formatMessage
  )
}

function generateMacro(macro: ExportType) {
  switch(macro) {
    case 'GOOGLE':
      return GOOGLE_CLICK_MACRO
    case 'APX':
      return APX_CLICK_MACRO
    default:
      return NONE_MACRO
  }
}
 
function generateSnippet(creativeId: string, width: number, height: number, type: ExportType) {
  return `<iframe src="//ads.mediarithmics.com/ads/render?ctx=LIVE&rid=${creativeId}&clktr="${generateMacro(type)}" width="${width}" height="${height}" frameborder="0" scrolling="no"></iframe>`
}