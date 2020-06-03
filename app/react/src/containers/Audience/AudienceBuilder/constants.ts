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
  noDemographicExpressions: {
    id: 'segmentBuilderSelector.category.demographics.noDemographicExpressions',
    defaultMessage: 'No Demographic Expressions',
  },

  // to delete
  industry: {
    id: 'segmentBuilderSelector.geographics.test1',
    defaultMessage: 'Industry',
  },
  automotive: {
    id: 'segmentBuilderSelector.geographics.test2',
    defaultMessage: 'Automotive',
  },
  region: {
    id: 'segmentBuilderSelector.geographics.test3',
    defaultMessage: 'Region',
  },
  name: {
    id: 'segmentBuilderSelector.geographics.test4',
    defaultMessage: 'Name',
  },
  height: {
    id: 'segmentBuilderSelector.geographics.test5',
    defaultMessage: 'Height',
  },
  weight: {
    id: 'segmentBuilderSelector.geographics.test6',
    defaultMessage: 'Weight',
  },
  food: {
    id: 'segmentBuilderSelector.geographics.test7',
    defaultMessage: 'Food',
  },
  politics: {
    id: 'segmentBuilderSelector.geographics.test8',
    defaultMessage: 'politics',
  },
  videogames: {
    id: 'segmentBuilderSelector.geographics.test9',
    defaultMessage: 'Video games',
  },
  // end to delete
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
                field: 'gender',
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
                field: 'age',
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
                field: 'language',
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
