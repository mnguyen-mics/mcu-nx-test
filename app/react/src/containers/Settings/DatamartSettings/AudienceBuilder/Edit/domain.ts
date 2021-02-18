import { AudienceFeatureResource } from '../../../../../models/audienceFeature';
import { AudienceBuilderResource } from '../../../../../models/audienceBuilder';

export type AudienceFeatureFormData = Partial<AudienceFeatureResource>;
export type AudienceBuilderFormData = Partial<AudienceBuilderResource>;

export const AUDIENCE_FEATURE_FORM_ID = 'audienceFeatureForm';
export const AUDIENCE_BUILDER_FORM_ID = 'audienceBuilderForm';
