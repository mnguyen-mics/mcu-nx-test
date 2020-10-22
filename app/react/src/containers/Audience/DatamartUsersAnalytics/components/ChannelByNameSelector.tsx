import { displayNameAdapted } from '../../Common/DimensionNameDisplay';
import { ResourceByKeywordSelector, ResourceFetcher, GetOptions } from './helpers/utils';
import { lazyInject } from '../../../../config/inversify.config';
import { TYPES } from '../../../../constants/types';
import { ChannelResourceShape, ChannelResource } from '../../../../models/settings/settings';
import { ChannelService } from '../../../../services/ChannelService';

type _ChannelResource = ChannelResourceShape | ChannelResource

class ChannelResourceFetcher implements ResourceFetcher<_ChannelResource> {
  @lazyInject(TYPES.IChannelService)
  channelService: ChannelService

  getForKeyword(options: GetOptions): Promise<_ChannelResource[]> {
    const queryOptions = {
      ...options,
      organisation_id: undefined,
      datamart_id: undefined
    }
    return this.channelService.getChannels(options.organisation_id, options.datamart_id, queryOptions)
      .then(res => res.data.sort((a, b) => a.name.localeCompare(b.name)))
  }
}

const ChannelByKeywordSelector = ResourceByKeywordSelector(displayNameAdapted<_ChannelResource>(),
  new ChannelResourceFetcher(),
  "Search channel by name")

export { ChannelByKeywordSelector }