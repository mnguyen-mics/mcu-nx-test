import { AutomationNodeShape } from './../../domain';
import {
  ABNNodeResource,
  ScenarioNodeShape,
  DisplayCampaignNodeResource,
  QueryInputNodeResource,
  EndNodeResource,
  EmailCampaignNodeResource,
  WaitNodeResource,
  IfNodeResource,
  AddToSegmentNodeResource,
  DeleteFromSegmentNodeResource,
  OnSegmentEntryInputNodeResource,
  OnSegmentExitInputNodeResource,
} from '../../../../../models/automations/automations';

import { ABNAutomationFormProps } from './ABNAutomationForm/ABNAutomationForm';
import { DefaultAutomationFormProps } from './DefaultForm/DefaultAutomationForm';
import { DisplayCampaignAutomationFormProps } from './DisplayCampaignForm/DisplayCampaignAutomationForm';
import { EmailCampaignFormData } from '../../../../Campaigns/Email/Edit/domain';

import { EmailCampaignAutomationFormProps } from './EmailCampaignForm/EmailCampaignAutomationForm';
import { generateFakeId } from '../../../../../utils/FakeIdHelper';
import { DisplayCampaignFormData } from '../../../../Campaigns/Display/Edit/domain';
import { QueryResource } from '../../../../../models/datamart/DatamartResource';
import { AddToSegmentAutomationFormProps } from './AddToSegmentNodeForm/AddToSegmentSegmentAutomationForm';
import { DeleteFromSegmentAutomationFormProps } from './DeleteFromSegmentNodeForm/DeleteFromSegmentAutomationForm';
import { ReactToEventAutomationFormProps } from './ReactToEventAutomationForm/ReactToEventAutomationForm';
import { QueryAutomationFormProps } from './QueryForm/QueryForm';
import { WaitAutomationFormProps } from './WaitForm/WaitForm';
import { OnSegmentExitInputAutomationFormProps } from './OnSegmentExitInputForm/OnSegmentExitInputAutomationForm';
import { OnSegmentEntryInputAutomationFormProps } from './OnSegmentEntryInputForm/OnSegmentEntryInputAutomationForm';

export interface DefaultFormData {}

export interface ABNFormData extends DefaultFormData {
  branch_number: number;
  edges_selection: any;
}

export interface WaitFormData extends DefaultFormData {
  wait_duration: {
    value: string;
    unit: 'days' | 'hours';
  };
}

export const INITIAL_ADD_TO_SEGMENT_NODE_FORM_DATA: AddToSegmentAutomationFormData = {
  ttl: {
    value: undefined,
    unit: 'days',
  },
};

export const INITIAL_DELETE_FROM_SEGMENT_NODE_FORM_DATA: DeleteFromSegmentAutomationFormData = {
  segmentId: undefined,
};

export const INITIAL_DISPLAY_CAMPAIGN_NODE_FORM_DATA: DisplayCampaignAutomationFormData = {
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
    automated: true,
  },
  adGroupFields: [
    {
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
        segmentFields: [],
      },
    },
  ],
  goalFields: [],
};

export const INITIAL_EMAIL_CAMPAIGN_NODE_FORM_DATA: EmailCampaignAutomationFormData = {
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
        segmentFields: [],
      },
    },
  ],
  routerFields: [],
  campaign: {
    organisation_id: '',
    automated: true,
    name: 'Send Email',
    editor_version_id: '17',
    editor_version_value: '',
    editor_group_id: '',
    editor_artifact_id: '',
    currency_code: 'EUR',
    technical_name: '',
    type: 'EMAIL',
  },
};

export const INITIAL_WAIT_DATA: WaitFormData = {
  wait_duration: {
    unit: 'days',
    value: '2',
  },
};

export interface DisplayCampaignAutomationFormData
  extends DefaultFormData,
    DisplayCampaignFormData {}

export interface EmailCampaignAutomationFormData
  extends DefaultFormData,
    EmailCampaignFormData {}

export interface AddToSegmentAutomationFormData extends DefaultFormData {
  audienceSegmentName?: string;
  audienceSegmentId?: string;
  ttl: {
    value?: string;
    unit: 'days' | 'months';
  };
}

export interface DeleteFromSegmentAutomationFormData extends DefaultFormData {
  segmentId?: string;
  audienceSegmentName?: string;
}

export interface OnSegmentEntryInputAutomationFormData extends DefaultFormData {
  datamartId?: string;
  segmentId?: string;
}

export interface OnSegmentExitInputAutomationFormData extends DefaultFormData {
  datamartId?: string;
  segmentId?: string;
}

export interface QueryInputAutomationFormData
  extends DefaultFormData,
    Partial<QueryResource> {
  uiCreationMode:
    | 'QUERY'
    | 'REACT_TO_EVENT_STANDARD'
    | 'REACT_TO_EVENT_ADVANCED';
}

export type AutomationFormDataType =
  | DefaultFormData
  | ABNFormData
  | DisplayCampaignAutomationFormData
  | AddToSegmentAutomationFormData
  | DeleteFromSegmentAutomationFormData
  | EmailCampaignAutomationFormData
  | QueryInputAutomationFormData
  | WaitFormData;

export type AutomationFormPropsType =
  | ABNAutomationFormProps
  | DefaultAutomationFormProps
  | DisplayCampaignAutomationFormProps
  | EmailCampaignAutomationFormProps
  | AddToSegmentAutomationFormProps
  | DeleteFromSegmentAutomationFormProps
  | ReactToEventAutomationFormProps
  | QueryAutomationFormProps
  | WaitAutomationFormProps
  | OnSegmentExitInputAutomationFormProps
  | OnSegmentEntryInputAutomationFormProps;

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

export function isAddToSegmentNode(
  node: AutomationNodeShape,
): node is AddToSegmentNodeResource {
  return node.type === 'ADD_TO_SEGMENT_NODE';
}

export function isDeleteFromSegmentNode(
  node: AutomationNodeShape,
): node is DeleteFromSegmentNodeResource {
  return node.type === 'DELETE_FROM_SEGMENT_NODE';
}

export function isQueryInputNode(
  node: AutomationNodeShape,
): node is QueryInputNodeResource {
  return (node as QueryInputNodeResource).type === 'QUERY_INPUT';
}

export function isOnSegmentEntryInputNode(
  node: AutomationNodeShape,
): node is OnSegmentEntryInputNodeResource {
  return (
    (node as OnSegmentEntryInputNodeResource).type ===
    'ON_SEGMENT_ENTRY_INPUT_NODE'
  );
}

export function isOnSegmentExitInputNode(
  node: AutomationNodeShape,
): node is OnSegmentExitInputNodeResource {
  return (
    (node as OnSegmentExitInputNodeResource).type ===
    'ON_SEGMENT_EXIT_INPUT_NODE'
  );
}

export function isWaitNode(
  node: AutomationNodeShape,
): node is WaitNodeResource {
  return (node as WaitNodeResource).type === 'WAIT_NODE';
}

export function isIfNode(node: AutomationNodeShape): node is IfNodeResource {
  return node.type === 'IF_NODE';
}

export function isEndNode(node: AutomationNodeShape): node is EndNodeResource {
  return node.type === 'END_NODE';
}
