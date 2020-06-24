import { AudienceBuilderFormData } from './../../../models/audienceBuilder/AudienceBuilderResource';
import { FormattedMessage, defineMessages } from 'react-intl';
import cuid from 'cuid';

export const messages: {
  [key: string]: FormattedMessage.MessageDescriptor;
} = defineMessages({
  title: {
    id: 'segmentBuilderSelector.title',
    defaultMessage: 'Segment Builder',
  },
  demographics: {
    id: 'segmentBuilderSelector.category.demographics',
    defaultMessage: 'Demographics',
  },
  totalAudience: {
    id: 'segmentBuilderSelector.totalAudience',
    defaultMessage: 'Total Audience',
  },
  male: {
    id: 'segmentBuilderSelector.category.demographics.male',
    defaultMessage: 'Male',
  },
  female: {
    id: 'segmentBuilderSelector.category.demographics.female',
    defaultMessage: 'Female',
  },
  all: {
    id: 'segmentBuilderSelector.category.demographics.all',
    defaultMessage: 'All',
  },
  age: {
    id: 'segmentBuilderSelector.category.demographics.age',
    defaultMessage: 'Age',
  },
  language: {
    id: 'segmentBuilderSelector.category.demographics.language',
    defaultMessage: 'Language',
  },
  gender: {
    id: 'segmentBuilderSelector.category.demographics.gender',
    defaultMessage: 'Gender',
  },
  tooltipGender: {
    id: 'segmentBuilderSelector.category.demographics.tooltiptGender',
    defaultMessage: 'Select the gender of your audience.',
  },
  tooltipAge: {
    id: 'segmentBuilderSelector.category.demographics.tooltiptAge',
    defaultMessage: 'Select the age of your audience.',
  },
  tooltipLanguage: {
    id: 'segmentBuilderSelector.category.demographics.tooltiptLanguage',
    defaultMessage: 'Select the language of your audience.',
  },
  narrowingWith: {
    id: 'segmentBuilderSelector.category.narrowingWith',
    defaultMessage: 'narrowing with',
  },
  excludingWith: {
    id: 'segmentBuilderSelector.category.excludingWith',
    defaultMessage: 'excluding with',
  },
  purchasIntent: {
    id: 'segmentBuilderSelector.liveDashboard.purchaseIntent',
    defaultMessage: 'Purchase Intent',
  },
  geographics: {
    id: 'segmentBuilderSelector.liveDashboard.geographics',
    defaultMessage: 'Geographics',
  },
  audienceFeatures: {
    id: 'segmentBuilderSelector.audienceFeature.card.title',
    defaultMessage: 'Audience Features',
  },
  addAudienceFeature: {
    id: 'segmentBuilderSelector.audienceFeatureSelector.actionBarTitle',
    defaultMessage: 'Add more audience features',
  },
  noDemographicExpressions: {
    id: 'segmentBuilderSelector.category.demographics.noDemographicExpressions',
    defaultMessage: 'No Demographic Expressions',
  },
  generalSectionTitle: {
    id: 'segmentBuilderSelector.parametricPredicateForm.generalSectionTitle',
    defaultMessage: 'Audience Feature',
  },
  generalSectionSubtitle: {
    id: 'segmentBuilderSelector.parametricPredicateForm.generalSectionSubtitle',
    defaultMessage: 'Select your audience features',
  },
  audienceFeatureId:{
    id: 'segmentBuilderSelector.audienceFeatureSelector.id',
    defaultMessage: 'ID',
  },
  audienceFeatureName:{
    id: 'segmentBuilderSelector.audienceFeatureSelector.name',
    defaultMessage: 'Name',
  },
  audienceFeatureDescription:{
    id: 'segmentBuilderSelector.audienceFeatureSelector.description',
    defaultMessage: 'Description',
  },
  searchAudienceFeature:{
    id: 'segmentBuilderSelector.audienceFeatureSelector.searchPlaceholder',
    defaultMessage: 'Search an audience feature',
  },
  audienceFeatureAdressableObject:{
    id: 'segmentBuilderSelector.audienceFeatureSelector.adressableObject',
    defaultMessage: 'Adressable Object',
  },
  audienceFeatureObjectTreeExpression:{
    id: 'segmentBuilderSelector.audienceFeatureSelector.objectTreeExpression',
    defaultMessage: 'Object Tree Expression',
  },
});

export const fieldGridConfig = {
  labelCol: { span: 3 },
  wrapperCol: { span: 15, offset: 1 },
};

export const FORM_ID = 'segmentBuilderFormData';

export const INITIAL_AUDIENCE_BUILDER_FORM_DATA: AudienceBuilderFormData = {
  // This is mocked data. Waiting for parametric predicates from backend 
  where: {
    type: 'GROUP',
    boolean_operator: 'AND',
    expressions: [
      {
        key: cuid(),
        model: {
          type: 'GROUP',
          boolean_operator: 'AND',
          expressions: [
            {
              key: cuid(),
              model: {
                type: 'FIELD',
                field: 'Gender',
                comparison: {
                  type: 'STRING',
                  operator: 'EQ',
                  values: [''],
                },
              },
            },
            {
              key: cuid(),
              model: {
                type: 'FIELD',
                field: 'Age',
                comparison: {
                  type: 'STRING',
                  operator: 'EQ',
                  values: [''],
                },
              },
            },
            {
              key: cuid(),
              model: {
                type: 'FIELD',
                field: 'Languages',
                comparison: {
                  type: 'STRING',
                  operator: 'EQ',
                  values: [''],
                },
              },
            },
          ],
        },
      },
    ],
  },
};
