import { displayNameAdapted } from '../../Common/DimensionNameDisplay';
import { ResourceByKeywordSelector, ResourceFetcher, GetOptions } from './helpers/utils';
import {
  DisplayCampaignService
} from '../../../../services/DisplayCampaignService';
import { lazyInject } from '../../../../config/inversify.config';
import { TYPES } from '../../../../constants/types';
import { DisplayCampaignResource } from '../../../../models/campaign/display';


class CampaignResourceFetcher implements ResourceFetcher<DisplayCampaignResource> {
  @lazyInject(TYPES.IDisplayCampaignService)
  campaignService: DisplayCampaignService

  getForKeyword(options: GetOptions): Promise<DisplayCampaignResource[]> {
    return this.campaignService.getDisplayCampaigns(options.organisation_id, 'DISPLAY', options)
      .then(res => res.data.sort((a, b) => a.name.localeCompare(b.name)))
  }
}

const CampaignByKeywordSelector = ResourceByKeywordSelector(displayNameAdapted<DisplayCampaignResource>(),
  new CampaignResourceFetcher(),
  "Search campaign by name")

export { CampaignByKeywordSelector }