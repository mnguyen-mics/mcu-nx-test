import { displayNameAdapted } from '../../Common/DimensionNameDisplay';
import { ResourceByKeywordSelector, ResourceFetcher, GetOptions } from './helpers/utils';
import {
  DisplayCampaignService
} from '../../../../services/DisplayCampaignService';
import { lazyInject } from '../../../../config/inversify.config';
import { TYPES } from '../../../../constants/types';
import { AdGroupResource } from '../../../../models/campaign/display';


class AdGroupResourceFetcher implements ResourceFetcher<AdGroupResource> {
  @lazyInject(TYPES.IDisplayCampaignService)
  campaignService: DisplayCampaignService

  getForKeyword(options: GetOptions): Promise<AdGroupResource[]> {
    return this.campaignService.findAdGroups(options.organisation_id, options)
      .then(res => res.data.sort((a, b) => a.name.localeCompare(b.name)))
  }
}

const AdGroupByKeywordSelector = ResourceByKeywordSelector(displayNameAdapted<AdGroupResource>(),
  new AdGroupResourceFetcher(),
  "Search ad group by name")

export { AdGroupByKeywordSelector }