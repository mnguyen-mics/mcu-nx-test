import { AudienceFeatureResource } from '../../../../../models/audienceFeature';
import { AudienceBuilderResource } from '../../../../../models/audienceBuilder';
import { FieldArrayModel } from "../../../../../utils/FormHelper";

export type AudienceFeatureFormData = Partial<AudienceFeatureResource>;
export type AudienceFeatureModel = FieldArrayModel<AudienceFeatureResource>;

export type AudienceBuilderFormData =  {
    audienceBuilder: Partial<AudienceBuilderResource>;
    audienceFeatureDemographics: AudienceFeatureModel[];
  }

export const AUDIENCE_FEATURE_FORM_ID = 'audienceFeatureForm';
export const AUDIENCE_BUILDER_FORM_ID = 'audienceBuilderForm';

export const INITIAL_AUDIENCE_BUILDER_FORM_DATA: AudienceBuilderFormData = {
    audienceBuilder: {},
    audienceFeatureDemographics: [],
};