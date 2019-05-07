import * as React from 'react';
import { defineMessages, FormattedMessage } from "react-intl";
import { HistoryKeys, formatToFormattingFunction, ValueFormat } from '../../resourcehistory/utils';
import { GoalResource } from '../../../models/goal/GoalResource';

const goalPropertiesMessageMap: {
  [propertyName in keyof GoalResource | HistoryKeys]: FormattedMessage.MessageDescriptor
} = defineMessages({
  id: {
    id: 'campaign.display.fields.id',
    defaultMessage: 'ID',
  },
	name: {
		id: 'campaign.display.fields.name',
    defaultMessage: 'Name',
	},
	technical_name: {
		id: 'campaign.display.fields.technicalName',
    defaultMessage: 'Technical Name',
	},
	default_goal_value: {
		id: 'campaign.display.fields.defaultGoalValue',
    defaultMessage: 'Default Goal Value',
	},
	goal_value_currency: {
		id: 'campaign.display.fields.goalValueCurrency',
    defaultMessage: 'Goal Value Currency',
	},
	datamart_id: {
		id: 'campaign.display.fields.datamartId',
    defaultMessage: 'Datamart ID',
	},
	new_query_id: {
		id: 'campaign.display.fields.newQueryid',
    defaultMessage: 'New Query ID',
	},
	organisation_id: {
		id: 'campaign.display.fields.organisationId',
    defaultMessage: 'Organisation ID',
	},
	archived: {
		id: 'campaign.display.fields.archived',
    defaultMessage: 'Archived',
	},
	status: {
		id: 'campaign.display.fields.status',
    defaultMessage: 'Status',
	},
  /*
  ==============================================================================
  ================================= EXTRA KEYS =================================
  ==============================================================================
  */
  history_title: {
    id: 'campaign.resourceHistory.title',
    defaultMessage: 'Goal History',
  },
  history_resource_type: {
    id: 'campaign.resourceHistory.type',
    defaultMessage: 'Goal',
  },
});

const goalPropertiesFormatMap: {
  [propertyName in keyof GoalResource | HistoryKeys]: {
    format: ValueFormat,
    messageMap?: {[key: string]: FormattedMessage.MessageDescriptor}
  }
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
	status: { format: 'STRING' },
  /*
  ==============================================================================
  ================================= EXTRA KEYS =================================
  ==============================================================================
  */
  history_title: { format: 'STRING' },
  history_resource_type: { format: 'STRING' },
}

function formatGoalProperty(property: keyof GoalResource | HistoryKeys, value?: string): {
	message: FormattedMessage.MessageDescriptor,
	formattedValue?: React.ReactNode,
  } {
	return {
	  message: goalPropertiesMessageMap[property],
	  formattedValue: (value && goalPropertiesFormatMap[property])
		? formatToFormattingFunction(value, goalPropertiesFormatMap[property].format, goalPropertiesFormatMap[property].messageMap)
		: undefined,
	}
}
  
export default formatGoalProperty;