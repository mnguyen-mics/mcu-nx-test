import { StandardSegmentBuilderFormData } from '../../../models/standardSegmentBuilder/StandardSegmentBuilderResource';
import { FormattedMessage, defineMessages } from 'react-intl';

export const messages: {
  [key: string]: FormattedMessage.MessageDescriptor;
} = defineMessages({
  title: {
    id: 'standardSegmentBuilder.title',
    defaultMessage: 'Standard Segment Builder',
  },
  demographics: {
    id: 'standardSegmentBuilder.category.demographics',
    defaultMessage: 'Initial audience features',
  },
  selectedAudience: {
    id: 'standardSegmentBuilder.selectedAudience',
    defaultMessage: 'users selected',
  },
  tooltipGender: {
    id: 'standardSegmentBuilder.category.demographics.tooltiptGender',
    defaultMessage: 'Select the gender of your audience.',
  },
  tooltipAge: {
    id: 'standardSegmentBuilder.category.demographics.tooltiptAge',
    defaultMessage: 'Select the age of your audience.',
  },
  tooltipLanguage: {
    id: 'standardSegmentBuilder.category.demographics.tooltiptLanguage',
    defaultMessage: 'Select the language of your audience.',
  },
  narrowingWith: {
    id: 'standardSegmentBuilder.category.narrowingWith',
    defaultMessage: 'narrowing with',
  },
  excludingWith: {
    id: 'standardSegmentBuilder.category.excludingWith',
    defaultMessage: 'excluding',
  },
  refreshMessage: {
    id: 'standardSegmentBuilder.liveDashboard.refreshMessage',
    defaultMessage: 'Your query has been modified, please click here to refresh',
  },
  audienceFeatures: {
    id: 'standardSegmentBuilder.audienceFeature.card.title',
    defaultMessage: 'Audience Features',
  },
  addAudienceFeature: {
    id: 'standardSegmentBuilder.audienceFeatureSelector.actionBarTitle',
    defaultMessage: 'Add more audience features',
  },
  addAudienceFeatureButton: {
    id: 'standardSegmentBuilder.audienceFeatureSelector.addButton',
    defaultMessage: 'Add',
  },
  noDemographicExpressions: {
    id: 'standardSegmentBuilder.category.demographics.noDemographicExpressions',
    defaultMessage: 'No Demographic Expressions',
  },
  generalSectionTitle: {
    id: 'standardSegmentBuilder.parametricPredicateForm.generalSectionTitle',
    defaultMessage: 'Audience Feature',
  },
  generalSectionSubtitle: {
    id: 'standardSegmentBuilder.parametricPredicateForm.generalSectionSubtitle',
    defaultMessage: 'Select your audience features',
  },
  audienceFeatureId: {
    id: 'standardSegmentBuilder.audienceFeatureSelector.id',
    defaultMessage: 'ID',
  },
  audienceFeatureName: {
    id: 'standardSegmentBuilder.audienceFeatureSelector.name',
    defaultMessage: 'Name',
  },
  audienceFeatureDescription: {
    id: 'standardSegmentBuilder.audienceFeatureSelector.description',
    defaultMessage: 'Description',
  },
  searchAudienceFeature: {
    id: 'standardSegmentBuilder.audienceFeatureSelector.searchPlaceholder',
    defaultMessage: 'Search an audience feature',
  },
  audienceFeatureAdressableObject: {
    id: 'standardSegmentBuilder.audienceFeatureSelector.adressableObject',
    defaultMessage: 'Adressable Object',
  },
  audienceFeatureObjectTreeExpression: {
    id: 'standardSegmentBuilder.audienceFeatureSelector.objectTreeExpression',
    defaultMessage: 'Object Tree Expression',
  },
  newAudienceSegment: {
    id: 'standardSegmentBuilder.newSegmentName',
    defaultMessage: 'New Audience Segment',
  },
  availableFilters: {
    id: 'standardSegmentBuilder.audienceFeatureSelector.availableFilters',
    defaultMessage: 'Available Filters',
  },
  noAvailableFilters: {
    id: 'standardSegmentBuilder.audienceFeatureSelector.noAvailableFilters',
    defaultMessage: 'There is no filter for this audience feature.',
  },
  standardSegmentBuilderInclude: {
    id: 'standardSegmentBuilder.include',
    defaultMessage: 'Include',
  },
  standardSegmentBuilderExclude: {
    id: 'standardSegmentBuilder.exclude',
    defaultMessage: 'Exclude',
  },
  standardSegmentBuilderTimelineMatchingCriterias0: {
    id: 'standardSegmentBuilder.timeline.matchingCriterias.and',
    defaultMessage: 'AND',
  },
  standardSegmentBuilderTimelineMatchingCriterias1: {
    id: 'standardSegmentBuilder.timeline.matchingCriterias.include',
    defaultMessage: 'People should match',
  },
  standardSegmentBuilderTimelineMatchingCriterias2: {
    id: 'standardSegmentBuilder.timeline.matchingCriterias.one',
    defaultMessage: 'one of these criterias',
  },
  standardSegmentBuilderTimelineExcludingCriterias1: {
    id: 'standardSegmentBuilder.timeline.excludingCriterias.exclude',
    defaultMessage: 'Exclude people matching',
  },
  standardSegmentBuilderTimelineExcludingCriterias2: {
    id: 'standardSegmentBuilder.timeline.excludingCriterias.one',
    defaultMessage: 'one of these criterias',
  },
  standardSegmentBuilderTimelineAddCriteria: {
    id: 'standardSegmentBuilder.timeline.addCriteria',
    defaultMessage: 'add criteria',
  },
  noData: {
    id: 'standardSegmentBuilder.audienceFeatureSelector.noData',
    defaultMessage: 'No data',
  },
});

export const fieldGridConfig = {
  labelCol: { span: 3 },
  wrapperCol: { span: 15, offset: 1 },
};

export const FORM_ID = 'segmentBuilderFormData';

export const NEW_FORM_ID = 'newStandardSegmenteBuilderFormData';

export const INITIAL_STANDARD_SEGMENT_BUILDER_FORM_DATA: StandardSegmentBuilderFormData = {
  include: [],
  exclude: [],
};
