import { lazyInject } from '../../../../config/inversify.config';
import { IAudienceSegmentService } from '../../../../services/AudienceSegmentService';
import { TYPES } from '../../../../constants/types';
import { SegmentNameDisplayProps, SegmentNameDisplay } from '../../Common/SegmentNameDisplay';
import ComponentPropsAdapter from '../../Common/ComponentPropsAdapter';
import { AudienceSegmentShape, AudienceSegmentType } from '../../../../models/audiencesegment';
import { ResourceFetcher, GetOptions, ResourceByKeywordSelector } from './helpers/utils';

class SegmentFetcher implements ResourceFetcher<AudienceSegmentShape> {
  @lazyInject(TYPES.IAudienceSegmentService)
  private _audienceSegmentService: IAudienceSegmentService;

  getForKeyword(options: GetOptions & SegmentByNameSelectorProps): Promise<AudienceSegmentShape[]> {
    return this._audienceSegmentService
      .getSegments(options.organisation_id, options)
      .then(res => res.data.sort((a, b) => a.name.localeCompare(b.name)));
  }
}

const segmentFetcher = new SegmentFetcher();
interface SegmentByNameSelectorProps {
  segmentType?: AudienceSegmentType;
  className?: string;
  showId?: boolean;
}

function audienceSegmentAdapter(s: AudienceSegmentShape): SegmentNameDisplayProps {
  return { audienceSegmentResource: s };
}

const SegmentNameDisplayAdapted = ComponentPropsAdapter(SegmentNameDisplay, audienceSegmentAdapter);
export default ResourceByKeywordSelector<AudienceSegmentShape, SegmentByNameSelectorProps>(
  SegmentNameDisplayAdapted,
  segmentFetcher,
  'Search segment by name',
);
