import { defineMessages, MessageDescriptor } from 'react-intl';
import {
  HistoryKeys,
  formatToFormattingFunction,
  ValueFormat,
} from '../../containers/ResourceHistory/utils';
import { GenericCreativeResource, CreativeSubtype } from '../../models/creative/CreativeResource';

const creativeSubtypeMessages: {
  [key in CreativeSubtype]: MessageDescriptor;
} = defineMessages({
  BANNER: {
    id: 'creative.fields.subtype.banner',
    defaultMessage: 'BANNER',
  },
  VIDEO: {
    id: 'creative.fields.subtype.video',
    defaultMessage: 'VIDEO',
  },
  FACEBOOK_RIGHT_HAND_SIDE: {
    id: 'creative.fields.subtype.facebookRightHandSide',
    defaultMessage: 'FACEBOOK_RIGHT_HAND_SIDE',
  },
  FACEBOOK_NEWS_FEED: {
    id: 'creative.fields.subtype.facebookNewsFeed',
    defaultMessage: 'FACEBOOK_NEWS_FEED',
  },
});

const creativePropertiesMessageMap: {
  [propertyName in keyof GenericCreativeResource | HistoryKeys]: MessageDescriptor;
} = defineMessages({
  id: {
    id: 'creative.fields.id',
    defaultMessage: 'Creative ID',
  },
  organisation_id: {
    id: 'creative.fields.organisationId',
    defaultMessage: 'Organisation ID',
  },
  name: {
    id: 'creative.fields.name',
    defaultMessage: 'Name',
  },
  technical_name: {
    id: 'creative.fields.technicalName',
    defaultMessage: 'Technical Name',
  },
  archived: {
    id: 'creative.fields.archived',
    defaultMessage: 'Archived',
  },
  editor_version_id: {
    id: 'creative.fields.editorVersionId',
    defaultMessage: 'Editor Version ID',
  },
  editor_version_value: {
    id: 'creative.fields.editorVersionValue',
    defaultMessage: 'Editor Version Value',
  },
  editor_group_id: {
    id: 'creative.fields.editorGroupId',
    defaultMessage: 'Editor Group ID',
  },
  editor_artifact_id: {
    id: 'creative.fields.editorArtifactId',
    defaultMessage: 'Editor Artifact ID',
  },
  editor_plugin_id: {
    id: 'creative.fields.editorPluginId',
    defaultMessage: 'Editor Plugin ID',
  },
  renderer_version_id: {
    id: 'creative.fields.rendererVersionId',
    defaultMessage: 'Renderer Version ID',
  },
  renderer_version_value: {
    id: 'creative.fields.rendererVersionValue',
    defaultMessage: 'Renderer Version Value',
  },
  renderer_group_id: {
    id: 'creative.fields.rendererGroupId',
    defaultMessage: 'Renderer Group ID',
  },
  renderer_artifact_id: {
    id: 'creative.fields.rendererArtifactId',
    defaultMessage: 'Renderer Artifact ID',
  },
  renderer_plugin_id: {
    id: 'creative.fields.rendererPluginId',
    defaultMessage: 'Renderer Plugin ID',
  },
  creation_date: {
    id: 'creative.fields.creationDate',
    defaultMessage: 'Creation Date',
  },
  subtype: {
    id: 'creative.fields.subtype',
    defaultMessage: 'Subtype',
  },
  /*
  ==============================================================================
  ================================= EXTRA KEYS =================================
  ==============================================================================
  */
  history_title: {
    id: 'creative.resourceHistory.title',
    defaultMessage: 'Creative History',
  },
  history_resource_type: {
    id: 'creative.resourceHistory.type',
    defaultMessage: 'Creative',
  },
});

const creativePropertiesFormatMap: {
  [propertyName in keyof GenericCreativeResource | HistoryKeys]: {
    format: ValueFormat;
    messageMap?: { [key: string]: MessageDescriptor };
  };
} = {
  organisation_id: { format: 'STRING' },
  id: { format: 'STRING' },
  name: { format: 'STRING' },
  technical_name: { format: 'STRING' },
  archived: { format: 'STRING' },
  editor_version_id: { format: 'STRING' },
  editor_version_value: { format: 'STRING' },
  editor_group_id: { format: 'STRING' },
  editor_artifact_id: { format: 'STRING' },
  editor_plugin_id: { format: 'STRING' },
  renderer_version_id: { format: 'STRING' },
  renderer_version_value: { format: 'STRING' },
  renderer_group_id: { format: 'STRING' },
  renderer_artifact_id: { format: 'STRING' },
  renderer_plugin_id: { format: 'STRING' },
  creation_date: { format: 'TIMESTAMP' },
  subtype: {
    format: 'MESSAGE',
    messageMap: creativeSubtypeMessages,
  },
  /*
  ==============================================================================
  ================================= EXTRA KEYS =================================
  ==============================================================================
  */
  history_title: { format: 'STRING' },
  history_resource_type: { format: 'STRING' },
};

function formatCreativeProperty(
  property: keyof GenericCreativeResource | HistoryKeys,
  value?: string,
): {
  message: MessageDescriptor;
  formattedValue?: React.ReactNode;
} {
  return {
    message: creativePropertiesMessageMap[property],
    formattedValue:
      value && creativePropertiesFormatMap[property]
        ? formatToFormattingFunction(
            value,
            creativePropertiesFormatMap[property].format,
            creativePropertiesFormatMap[property].messageMap,
          )
        : undefined,
  };
}

export default formatCreativeProperty;
