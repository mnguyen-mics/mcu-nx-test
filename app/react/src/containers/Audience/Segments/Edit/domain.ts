import { UserListSegment } from "../../../../models/audiencesegment/";


export interface EditAudienceSegmentParam {
  organisationId: string;
  segmentId: string;
  type: SegmentTypeFormLoader;
}

export type DefaultLiftimeUnit = 'days' | 'weeks' | 'months'

export interface AudienceSegmentFormData {
  audienceSegment: Partial<UserListSegment>;
  defaultLiftime?: number;
  defaultLiftimeUnit: DefaultLiftimeUnit;
}

export type SegmentTypeFormLoader =
  'USER_LIST' |
  'USER_PIXEL'

export const INITIAL_AUDIENCE_SEGMENT_FORM_DATA: AudienceSegmentFormData = {
  audienceSegment: {
  },
  defaultLiftimeUnit: 'days'
};
