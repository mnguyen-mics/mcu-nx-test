import { ProcessingActivityFieldModel } from './../../../Settings/DatamartSettings/Common/domain';
import { ProcessingSelectionResource } from './../../../../models/processing';
import { UploadFile } from 'antd/lib/upload/interface';
import { AudienceSegmentShape } from '../../../../models/audiencesegment/';
import { FieldArrayModel } from '../../../../utils/FormHelper';
import { PluginProperty, AudienceExternalFeed, AudienceTagFeed } from '../../../../models/Plugins';
import { QueryResource } from '../../../../models/datamart/DatamartResource';
import {
  UserQuerySegment,
  UserListSegment,
  UserActivationSegment,
} from '../../../../models/audiencesegment/AudienceSegmentResource';
import { NewUserQuerySimpleFormData } from '../../../QueryTool/SaveAs/NewUserQuerySegmentSimpleForm';
import * as moment from 'moment';
import { StandardSegmentBuilderQueryDocument } from '../../../../models/standardSegmentBuilder/StandardSegmentBuilderResource';

export interface EditAudienceSegmentParam {
  organisationId: string;
  segmentId: string;
}

export type DefaultLiftimeUnit = 'days' | 'weeks' | 'months';

export interface AudienceExternalFeedResource extends AudienceExternalFeed {
  properties?: PluginProperty[];
}

export interface AudienceTagFeedResource extends AudienceTagFeed {
  properties?: PluginProperty[];
}

export interface AudienceExternalFeedTyped extends AudienceExternalFeed {
  type: 'EXTERNAL_FEED';
}

export interface AudienceTagFeedTyped extends AudienceTagFeed {
  type: 'TAG_FEED';
}

export type AudienceFeedTyped = AudienceExternalFeedTyped | AudienceTagFeedTyped;

export type AudienceExternalFeedsFieldModel = FieldArrayModel<AudienceExternalFeedResource>;

export type AudienceTagFeedsFieldModel = FieldArrayModel<AudienceTagFeedResource>;

export interface AudienceSegmentFormData {
  audienceSegment: Partial<AudienceSegmentShape>;
  initialProcessingSelectionResources: ProcessingSelectionResource[];
  processingActivities: ProcessingActivityFieldModel[];
  defaultLifetime?: number | null;
  defaultLifetimeUnit?: DefaultLiftimeUnit;
  query?: QueryResource;
  userListFiles?: UploadFile[];
}

export const INITIAL_AUDIENCE_SEGMENT_FORM_DATA: AudienceSegmentFormData = {
  audienceSegment: {
    persisted: true,
  },
  initialProcessingSelectionResources: [],
  processingActivities: [],
  defaultLifetimeUnit: 'days',
  userListFiles: [],
};

export function isAudienceSegmentShape(
  source?: AudienceSegmentShape | StandardSegmentBuilderQueryDocument,
): source is AudienceSegmentShape {
  return source !== undefined && (source as AudienceSegmentShape).type !== undefined;
}

export function isUserQuerySegment(segment: AudienceSegmentShape): segment is UserQuerySegment {
  return (segment as UserQuerySegment).query_id !== undefined;
}

export function isUserListSegment(segment: AudienceSegmentShape): segment is UserListSegment {
  return (
    (segment as UserListSegment).type === 'USER_LIST' &&
    (segment as UserListSegment).subtype === 'STANDARD'
  );
}

export function isUserActivationSegment(
  segment: AudienceSegmentShape,
): segment is UserActivationSegment {
  return (segment as UserActivationSegment).type === 'USER_ACTIVATION';
}

export function isUserPixelSegment(segment: AudienceSegmentShape): segment is UserListSegment {
  return (
    (segment as UserListSegment).type === 'USER_LIST' &&
    (segment as UserListSegment).subtype !== 'USER_PIXEL'
  );
}

export function isEdgeSegment(segment: AudienceSegmentShape): segment is UserListSegment {
  return (
    (segment as UserListSegment).type === 'USER_LIST' &&
    (segment as UserListSegment).subtype !== 'USER_CLIENT'
  );
}

export function calculateDefaultTtl(formData: Partial<NewUserQuerySimpleFormData>) {
  if (formData.defaultLifetime && formData.defaultLifetimeUnit) {
    return moment
      .duration(Number(formData.defaultLifetime), formData.defaultLifetimeUnit)
      .asMilliseconds();
  }
  return undefined;
}
