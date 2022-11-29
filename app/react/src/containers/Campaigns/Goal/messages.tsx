import * as React from 'react';
import { defineMessages, MessageDescriptor } from 'react-intl';
import {
  HistoryKeys,
  formatToFormattingFunction,
  ValueFormat,
} from '../../../containers/ResourceHistory/utils';
import { GoalResource, GoalStatus } from '../../../models/goal/GoalResource';

const goalStatusMessages: {
  [key in GoalStatus]: MessageDescriptor;
} = defineMessages({
  PAUSED: {
    id: 'goal.fields.status.paused',
    defaultMessage: 'Paused',
  },
  ACTIVE: {
    id: 'goal.fields.status.active',
    defaultMessage: 'Active',
  },
});

const goalPropertiesMessageMap: {
  [propertyName in keyof GoalResource | HistoryKeys]: MessageDescriptor;
} = defineMessages({
  id: {
    id: 'goal.fields.id',
    defaultMessage: 'ID',
  },
  name: {
    id: 'goal.fields.name',
    defaultMessage: 'Name',
  },
  technical_name: {
    id: 'goal.fields.technicalName',
    defaultMessage: 'Technical Name',
  },
  default_goal_value: {
    id: 'goal.fields.defaultGoalValue',
    defaultMessage: 'Default Goal Value',
  },
  goal_value_currency: {
    id: 'goal.fields.goalValueCurrency',
    defaultMessage: 'Goal Value Currency',
  },
  datamart_id: {
    id: 'goal.fields.datamartId',
    defaultMessage: 'Datamart ID',
  },
  new_query_id: {
    id: 'goal.fields.newQueryId',
    defaultMessage: 'New Query ID',
  },
  organisation_id: {
    id: 'goal.fields.organisationId',
    defaultMessage: 'Organisation ID',
  },
  archived: {
    id: 'goal.fields.archived',
    defaultMessage: 'Archived',
  },
  status: {
    id: 'goal.fields.status',
    defaultMessage: 'Status',
  },
  /*
  ==============================================================================
  ================================= EXTRA KEYS =================================
  ==============================================================================
  */
  history_title: {
    id: 'goal.resourceHistory.title',
    defaultMessage: 'Goal History',
  },
  history_resource_type: {
    id: 'goal.resourceHistory.type',
    defaultMessage: 'Goal',
  },
});

const goalPropertiesFormatMap: {
  [propertyName in keyof GoalResource | HistoryKeys]: {
    format: ValueFormat;
    messageMap?: { [key: string]: MessageDescriptor };
  };
} = {
  id: { format: 'STRING' },
  name: { format: 'STRING' },
  technical_name: { format: 'STRING' },
  default_goal_value: { format: 'FLOAT' },
  goal_value_currency: { format: 'STRING' },
  datamart_id: { format: 'STRING' },
  new_query_id: { format: 'STRING' },
  organisation_id: { format: 'STRING' },
  archived: { format: 'STRING' },
  status: {
    format: 'MESSAGE',
    messageMap: goalStatusMessages,
  },
  /*
  ==============================================================================
  ================================= EXTRA KEYS =================================
  ==============================================================================
  */
  history_title: { format: 'STRING' },
  history_resource_type: { format: 'STRING' },
};

export const formatGoalProperty = (
  property: keyof GoalResource | HistoryKeys,
  value?: string,
): {
  message: MessageDescriptor;
  formattedValue?: React.ReactNode;
} => {
  return {
    message: goalPropertiesMessageMap[property],
    formattedValue:
      value && goalPropertiesFormatMap[property]
        ? formatToFormattingFunction(
            value,
            goalPropertiesFormatMap[property].format,
            goalPropertiesFormatMap[property].messageMap,
          )
        : undefined,
  };
};
