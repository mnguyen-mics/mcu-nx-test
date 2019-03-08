import { AutomationNodeShape } from './../../domain';
import {
  ABNNodeResource,
  ScenarioNodeShape,
  DisplayCampaignNodeResource,
  QueryInputNodeResource,
  EndNodeResource,
  EmailCampaignNodeResource,
  WaitNodeResource,
} from '../../../../../models/automations/automations';

import { ABNAutomationFormProps } from './ABNAutomationForm/ABNAutomationForm';
import { DefaultAutomationFormProps } from './DefaultForm/DefaultAutomationForm';
import { DisplayCampaignAutomationFormProps } from './DisplayCampaignForm/DisplayCampaignAutomationForm';
import {
  EmailCampaignFormData,
} from '../../../../Campaigns/Email/Edit/domain';

import { EmailCampaignAutomationFormProps } from './EmailCampaignForm/EmailCampaignAutomationForm';
import { generateFakeId } from '../../../../../utils/FakeIdHelper';
import { DisplayCampaignFormData } from '../../../../Campaigns/Display/Edit/domain';
import { QueryCreateRequest } from '../../../../../models/datamart/DatamartResource';

export interface DefaultFormData {
  name: string;
}

export interface ABNFormData extends DefaultFormData {
  branch_number: number;
  edges_selection: any;
}

export interface WaitFormData extends DefaultFormData {
  timeout: number;
}

export const INITIAL_DISPLAY_CAMPAIGN_NODE_FORM_DATA: DisplayCampaignAutomationFormData = {
  name: 'Display Advertising',
  campaign: {
    organisation_id: '',
    name: 'Display Advertising',
    editor_version_id: '11',
    currency_code: 'EUR',
    technical_name: '',
    subtype: 'PROGRAMMATIC',
    max_bid_price: 0,
    total_budget: 0,
    max_budget_per_period: 0,
    max_budget_period: 'WEEK',
    total_impression_capping: 0,
    per_day_impression_capping: 0,
    time_zone: 'Europe/Paris',
    model_version: 'V2017_09',
    type: 'DISPLAY',
  },
  adGroupFields: [{
    key: generateFakeId(),
    model: {
      adGroup: {
        total_impression_capping: 10,
        max_budget_period: 'DAY',
        targeted_operating_systems: 'ALL',
        targeted_medias: 'WEB',
        targeted_devices: 'ALL',
        targeted_connection_types: 'ALL',
        targeted_browser_families: 'ALL',
      },
      adFields: [],
      bidOptimizerFields: [],
      inventoryCatalFields: [],
      locationFields: [],
      segmentFields: []
    }
  }],
  goalFields: []
};

export const INITIAL_EMAIL_CAMPAIGN_NODE_FORM_DATA: EmailCampaignAutomationFormData = {
  name: 'Send Email',
  
  blastFields: [
    {
      key: generateFakeId(),
      model: {
        blast: {
          blast_name: '',
          subject_line: '',
          from_email: '',
          from_name: '',
          reply_to: '',
          send_date: 0,
          batch_size: 0,
        },
        templateFields: [],
        consentFields: [],
        segmentFields: []
      },
    }
  ],
  routerFields: [],
  campaign: {
    organisation_id: '',
    name: 'Send Email',
    editor_versionid: '17',
    editor_version_value: '',
    editor_groupid: '',
    editor_artifact_id: '',
    currency_code: 'EUR',
    technical_name: '',
    type: 'EMAIL',
  },
};

export const INITIAL_QUERY_DATA: (datamartId: string) => QueryAutomationFormData = (datamartId: string) => {
  return {
    datamart_id: datamartId,
    name: '',
    query_language: undefined,
    query_text: ''
  }
}

export const INITIAL_WAIT_DATA: WaitFormData = {
  name: 'Wait',
  timeout: 1000 * 60 * 60 * 24 * 2 // 2 days
}

export interface DisplayCampaignAutomationFormData extends DefaultFormData, DisplayCampaignFormData {
}

export interface EmailCampaignAutomationFormData extends DefaultFormData, EmailCampaignFormData {
}

export interface QueryAutomationFormData extends Partial<QueryCreateRequest> {
  name: string
}

export type AutomationFormDataType =
  | DefaultFormData
  | ABNFormData
  | DisplayCampaignAutomationFormData
  | EmailCampaignAutomationFormData
  | QueryAutomationFormData;

export type AutomationFormPropsType =
  | ABNAutomationFormProps
  | DefaultAutomationFormProps
  | DisplayCampaignAutomationFormProps
  | EmailCampaignAutomationFormProps;

export const FORM_ID = 'automationNodeForm';

export function isScenarioNodeShape(
  node: AutomationNodeShape,
): node is ScenarioNodeShape {
  return (node as AutomationNodeShape).type !== 'DROP_NODE';
}

export function isAbnNode(node: AutomationNodeShape): node is ABNNodeResource {
  return node.type === 'ABN_NODE';
}

export function isDisplayCampaignNode(
  node: AutomationNodeShape,
): node is DisplayCampaignNodeResource {
  return node.type === 'DISPLAY_CAMPAIGN';
}

export function isEmailCampaignNode(
  node: AutomationNodeShape,
): node is EmailCampaignNodeResource {
  return node.type === 'EMAIL_CAMPAIGN';
}

export function isQueryInputNode(
  node: AutomationNodeShape,
): node is QueryInputNodeResource {
  return (
    (node as QueryInputNodeResource).type ===
      'QUERY_INPUT'
  );
}

export function isWaitNode(
  node: AutomationNodeShape,
): node is WaitNodeResource {
  return (
    (node as WaitNodeResource).type ===
      'WAIT_NODE'
  );
}


export function isEndNode(node: AutomationNodeShape): node is EndNodeResource {
  return node.type === 'END_NODE';
}
