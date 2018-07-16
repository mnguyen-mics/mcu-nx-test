import { UploadFile } from 'antd/lib/upload/interface';
import { AudienceSegmentShape } from "../../../../models/audiencesegment/";
import { FieldArrayModel } from "../../../../utils/FormHelper";
import { PluginProperty, AudienceExternalFeed, AudienceTagFeed } from "../../../../models/Plugins";
import { QueryResource } from "../../../../models/datamart/DatamartResource";


export interface EditAudienceSegmentParam {
  organisationId: string;
  segmentId: string;
}

export type DefaultLiftimeUnit = 'days' | 'weeks' | 'months'

export interface AudienceExternalFeedResource extends AudienceExternalFeed {
  properties?: PluginProperty[]
}

export interface AudienceTagFeedResource extends AudienceTagFeed {
  properties?: PluginProperty[]
}

export interface AudienceExternalFeedTyped extends AudienceExternalFeed {
  type: 'EXTERNAL_FEED'
}

export interface AudienceTagFeedTyped extends AudienceTagFeed {
  type: 'TAG_FEED'
}

export type AudienceExternalFeedsFieldModel = FieldArrayModel<AudienceExternalFeedResource>;

export type AudienceTagFeedsFieldModel = FieldArrayModel<AudienceTagFeedResource>

export interface AudienceSegmentFormData {
  audienceSegment: Partial<AudienceSegmentShape>;
  defaultLiftime?: number;
  defaultLiftimeUnit?: DefaultLiftimeUnit;
  query?: QueryResource;
  userListFiles?: UploadFile[];
}

export const INITIAL_AUDIENCE_SEGMENT_FORM_DATA: AudienceSegmentFormData = {
  audienceSegment: {
    persisted: true
  },
  defaultLiftimeUnit: 'days',
  userListFiles: [],
};
