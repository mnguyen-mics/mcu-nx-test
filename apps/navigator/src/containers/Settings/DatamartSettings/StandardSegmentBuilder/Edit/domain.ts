import { AudienceFeatureResource } from '../../../../../models/audienceFeature';
import { StandardSegmentBuilderResource } from '../../../../../models/standardSegmentBuilder';
import { FieldArrayModel } from '../../../../../utils/FormHelper';

export type AudienceFeatureFormData = Partial<AudienceFeatureResource>;
export type AudienceFeatureModel = FieldArrayModel<AudienceFeatureResource>;

export type StandardSegmentBuilderFormData = {
  standardSegmentBuilder: Partial<StandardSegmentBuilderResource>;
  initialAudienceFeatures: AudienceFeatureModel[];
};

export const AUDIENCE_FEATURE_FORM_ID = 'audienceFeatureForm';
export const STANDARD_SEGMENT_BUILDER_FORM_ID = 'standardSegmentBuilderForm';

export const INITIAL_STANDARD_SEGMENT_BUILDER_FORM_DATA: StandardSegmentBuilderFormData = {
  standardSegmentBuilder: {},
  initialAudienceFeatures: [],
};
