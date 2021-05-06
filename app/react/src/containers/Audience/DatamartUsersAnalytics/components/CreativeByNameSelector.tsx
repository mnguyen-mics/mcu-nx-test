import { displayNameAdapted } from '../../Common/DimensionNameDisplay';
import { ResourceByKeywordSelector, ResourceFetcher, GetOptions } from './helpers/utils';
import { lazyInject } from '../../../../config/inversify.config';
import { TYPES } from '../../../../constants/types';
import {
  CreativeResourceShape,
  GenericCreativeResource,
} from '../../../../models/creative/CreativeResource';
import { CreativeService, CreativesOptions } from '../../../../services/CreativeService';

type CreativeResource = CreativeResourceShape | GenericCreativeResource;

class CreativeResourceFetcher implements ResourceFetcher<CreativeResource> {
  @lazyInject(TYPES.ICreativeService)
  creativeService: CreativeService;

  getForKeyword(options: GetOptions & CreativesOptions): Promise<CreativeResource[]> {
    const queryOptions = {
      ...options,
    };
    return this.creativeService
      .getCreatives(options.organisation_id, queryOptions)
      .then(res => res.data.sort((a, b) => a.name.localeCompare(b.name)));
  }
}

const CreativeByKeywordSelector = ResourceByKeywordSelector(
  displayNameAdapted<CreativeResource>(),
  new CreativeResourceFetcher(),
  'Search creative by name',
);

export { CreativeByKeywordSelector };
