import {
  AudienceBuilderFormData,
  NewAudienceBuilderFormData,
  QueryDocument,
} from './../../../models/audienceBuilder/AudienceBuilderResource';
import { FormattedMessage, defineMessages } from 'react-intl';

export const messages: {
  [key: string]: FormattedMessage.MessageDescriptor;
} = defineMessages({
  title: {
    id: 'audienceBuilder.title',
    defaultMessage: 'Audience Builders',
  },
  demographics: {
    id: 'audienceBuilder.category.demographics',
    defaultMessage: 'Demographics',
  },
  selectedAudience: {
    id: 'audienceBuilder.selectedAudience',
    defaultMessage: 'Selected Audience',
  },
  tooltipGender: {
    id: 'audienceBuilder.category.demographics.tooltiptGender',
    defaultMessage: 'Select the gender of your audience.',
  },
  tooltipAge: {
    id: 'audienceBuilder.category.demographics.tooltiptAge',
    defaultMessage: 'Select the age of your audience.',
  },
  tooltipLanguage: {
    id: 'audienceBuilder.category.demographics.tooltiptLanguage',
    defaultMessage: 'Select the language of your audience.',
  },
  refreshMessage: {
    id: 'audienceBuilder.liveDashboard.refreshMessage',
    defaultMessage:
      'Your query has been modified, please click here to refresh',
  },
  audienceFeatures: {
    id: 'audienceBuilder.audienceFeature.card.title',
    defaultMessage: 'Audience Features',
  },
  addAudienceFeature: {
    id: 'audienceBuilder.audienceFeatureSelector.actionBarTitle',
    defaultMessage: 'Add more audience features',
  },
  addAudienceFeatureButton: {
    id: 'audienceBuilder.audienceFeatureSelector.addButton',
    defaultMessage: 'Add',
  },
  noDemographicExpressions: {
    id: 'audienceBuilder.category.demographics.noDemographicExpressions',
    defaultMessage: 'No Demographic Expressions',
  },
  generalSectionTitle: {
    id: 'audienceBuilder.parametricPredicateForm.generalSectionTitle',
    defaultMessage: 'Audience Feature',
  },
  generalSectionSubtitle: {
    id: 'audienceBuilder.parametricPredicateForm.generalSectionSubtitle',
    defaultMessage: 'Select your audience features',
  },
  audienceFeatureId: {
    id: 'audienceBuilder.audienceFeatureSelector.id',
    defaultMessage: 'ID',
  },
  audienceFeatureName: {
    id: 'audienceBuilder.audienceFeatureSelector.name',
    defaultMessage: 'Name',
  },
  audienceFeatureDescription: {
    id: 'audienceBuilder.audienceFeatureSelector.description',
    defaultMessage: 'Description',
  },
  searchAudienceFeature: {
    id: 'audienceBuilder.audienceFeatureSelector.searchPlaceholder',
    defaultMessage: 'Search an audience feature',
  },
  audienceFeatureAdressableObject: {
    id: 'audienceBuilder.audienceFeatureSelector.adressableObject',
    defaultMessage: 'Adressable Object',
  },
  audienceFeatureObjectTreeExpression: {
    id: 'audienceBuilder.audienceFeatureSelector.objectTreeExpression',
    defaultMessage: 'Object Tree Expression',
  },
  newAudienceSegment: {
    id: 'audienceBuilder.newSegmentName',
    defaultMessage: 'New Audience Segment',
  },
  availableFilters: {
    id: 'audienceBuilder.audienceFeatureSelector.availableFilters',
    defaultMessage: 'Available Filters',
  }, 
  audienceBuilderTimelineMatchingCriterias0: {
    id: 'audienceBuilder.timeline.matchingCriterias.and',
    defaultMessage: 'AND ',
  },
  audienceBuilderTimelineMatchingCriterias1: {
    id: 'audienceBuilder.timeline.matchingCriterias.include',
    defaultMessage: 'People should match ',
  },
  audienceBuilderTimelineMatchingCriterias2: {
    id: 'audienceBuilder.timeline.matchingCriterias.one',
    defaultMessage: 'one of these criterias',
  },
  audienceBuilderTimelineExcludingCriterias1: {
    id: 'audienceBuilder.timeline.excludingCriterias.exclude',
    defaultMessage: 'Exclude people matching ',
  },
  audienceBuilderTimelineExcludingCriterias2: {
    id: 'audienceBuilder.timeline.excludingCriterias.one',
    defaultMessage: 'one of these criterias',
  },
  audienceBuilderTimelineAddCriteria: {
    id: 'audienceBuilder.timeline.addCriteria',
    defaultMessage: 'add criteria',
  },
});

export const fieldGridConfig = {
  labelCol: { span: 3 },
  wrapperCol: { span: 15, offset: 1 },
};

export const FORM_ID = 'segmentBuilderFormData';

export const INITIAL_AUDIENCE_BUILDER_FORM_DATA: AudienceBuilderFormData = {
  where: {
    type: 'GROUP',
    boolean_operator: 'AND',
    expressions: [
      {
        type: 'GROUP',
        boolean_operator: 'OR',
        expressions: [],
      },
    ],
  },
};

export const NEW_FORM_ID = 'newAudienceBuilderFormData';

export const NEW_INITIAL_AUDIENCE_BUILDER_FORM_DATA: NewAudienceBuilderFormData = {
  include: [],
  exclude: []
};

// TODO Remove along with AudienceBuilderQueryService 
export const buildQueryDocument = (formData: AudienceBuilderFormData) => {
  let query: QueryDocument = {
    language_version: 'JSON_OTQL',
    operations: [
      {
        directives: [
          {
            name: 'count',
          },
        ],
        selections: [],
      },
    ],
    from: 'UserPoint',
  };
  const clauseWhere = formData?.where;

  if (clauseWhere) {
    query = {
      ...query,
      where: clauseWhere,
    };
  }
  return query as any;
};
