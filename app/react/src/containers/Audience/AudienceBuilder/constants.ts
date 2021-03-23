import {
  AudienceBuilderFormData,
  QueryDocument,
} from './../../../models/audienceBuilder/AudienceBuilderResource';
import {
  IAudienceFeatureService,
  AudienceFeatureOptions,
} from '../../../services/AudienceFeatureService';
import { getPaginatedApiParam } from '../../../utils/ApiHelper';
import {
  AudienceFeatureResource,
  AudienceFeatureFolderResource,
} from '../../../models/audienceFeature';
import { AudienceFeaturesByFolder } from '../../../models/audienceFeature/AudienceFeatureResource';
import { SearchFilter } from '@mediarithmics-private/mcs-components-library/lib/utils';
import { FormattedMessage, defineMessages } from 'react-intl';
import { Action } from 'redux-actions';

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
  narrowingWith: {
    id: 'audienceBuilder.category.narrowingWith',
    defaultMessage: 'narrowing with',
  },
  excludingWith: {
    id: 'audienceBuilder.category.excludingWith',
    defaultMessage: 'excluding',
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

export const fetchFolders = (
  audienceFeatureService: IAudienceFeatureService,
  datamartId: string,
  notifyError: (err: any, notifConfig?: any) => Action<any>,
) => {
  return audienceFeatureService
    .getAudienceFeatureFolders(datamartId)
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      notifyError(err);
      return [];
    });
};

export const fetchAudienceFeatures = (
  audienceFeatureService: IAudienceFeatureService,
  datamartId: string,
  filter?: SearchFilter,
  demographicIds?: string[],
) => {
  const options: AudienceFeatureOptions = {
    ...getPaginatedApiParam(filter?.currentPage, filter?.pageSize),
  };

  if (filter?.keywords) {
    options.keywords = [filter.keywords];
  }

  if (demographicIds && demographicIds.length >= 1) {
    options.exclude = demographicIds;
  }

  return audienceFeatureService
    .getAudienceFeatures(datamartId, options)
    .then((res) => {
      return res.data;
    });
};

const folderLoop = (
  folders: AudienceFeatureFolderResource[],
  features: AudienceFeatureResource[],
): AudienceFeaturesByFolder[] => {
  return folders.map((folder) => {
    return {
      id: folder.id,
      name: folder.name,
      parent_id: folder.parent_id,
      audience_features: features.filter((f: AudienceFeatureResource) =>
        folder.audience_features_ids?.includes(f.id),
      ),
      children: folderLoop(
        folders.filter(
          (f: AudienceFeatureFolderResource) =>
            f.id !== null && folder.children_ids?.includes(f.id),
        ),
        features,
      ),
    };
  });
};

export const creatBaseFolder = (
  name: string,
  folders: AudienceFeatureFolderResource[],
  features: AudienceFeatureResource[],
): AudienceFeaturesByFolder => {
  return {
    id: null,
    name: name,
    parent_id: 'root',
    children: folderLoop(
      folders.filter(
        (f: AudienceFeatureFolderResource) => f.parent_id === null,
      ),
      features,
    ),
    audience_features: features.filter(
      (f: AudienceFeatureResource) => f.folder_id === null,
    ),
  };
};

export const getFolder = (
  id: string | null,
  audienceFeaturesByFolder?: AudienceFeaturesByFolder,
) => {
  let selectedFolder: AudienceFeaturesByFolder | undefined;
  const loop = (folder: AudienceFeaturesByFolder) => {
    if (id === null) {
      selectedFolder = audienceFeaturesByFolder;
    } else {
      folder.children.forEach((f) => {
        if (f.id === id) {
          selectedFolder = f;
        } else {
          loop(f);
        }
      });
    }
  };
  if (audienceFeaturesByFolder) loop(audienceFeaturesByFolder);
  return selectedFolder;
};