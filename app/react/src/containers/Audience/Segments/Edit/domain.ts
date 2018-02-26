import { AudienceSegmentShape } from "../../../../models/audiencesegment/";
import { FieldArrayModel } from "../../../../utils/FormHelper";
import { PluginProperty, AudienceExternalFeed, AudienceTagFeed } from "../../../../models/Plugins";
import { QueryResource } from "../../../../models/datamart/DatamartResource";


export interface EditAudienceSegmentParam {
  organisationId: string;
  segmentId: string;
  type: SegmentTypeFormLoader;
}

export type DefaultLiftimeUnit = 'days' | 'weeks' | 'months'

export interface AudienceExternalFeedResource extends AudienceExternalFeed {
  properties?: PluginProperty[]
}

export interface AudienceTagFeedResource extends AudienceTagFeed {
  properties?: PluginProperty[]
}

export type AudienceExternalFeedsFieldModel = FieldArrayModel<AudienceExternalFeedResource>;

export type AudienceTagFeedsFieldModel = FieldArrayModel<AudienceTagFeedResource>

export interface AudienceSegmentFormData {
  audienceSegment: Partial<AudienceSegmentShape>;
  defaultLiftime?: number;
  defaultLiftimeUnit: DefaultLiftimeUnit;
  audienceExternalFeeds: AudienceExternalFeedsFieldModel[];
  audienceTagFeeds: AudienceTagFeedsFieldModel[];
  query?: QueryResource;
}



export type SegmentTypeFormLoader =
  'USER_LIST' |
  'USER_PIXEL' |
  'USER_QUERY'

export const INITIAL_AUDIENCE_SEGMENT_FORM_DATA: AudienceSegmentFormData = {
  audienceSegment: {
    persisted: false
  },
  defaultLiftimeUnit: 'days',
  audienceExternalFeeds: [],
  audienceTagFeeds: [],
};
