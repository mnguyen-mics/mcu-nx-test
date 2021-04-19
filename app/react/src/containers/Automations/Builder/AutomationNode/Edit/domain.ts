import { PropertyResourceShape } from './../../../../../models/plugin/index';
import {
  CustomActionNodeResource,
  FeedNodeResource,
  InputNodeResource,
} from './../../../../../models/automations/automations';
import { CustomActionAutomationFormProps, ExtendedCustomActionInformation } from './CustomActionNodeForm/CustomActionAutomationForm';
import { Moment } from 'moment';
import { ProcessingActivityFieldModel } from './../../../../Settings/DatamartSettings/Common/domain';
import { AutomationNodeShape } from './../../domain';
import {
  ABNNodeResource,
  ScenarioNodeShape,
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
import { EmailCampaignFormData } from '../../../../Campaigns/Email/Edit/domain';

import { EmailCampaignAutomationFormProps } from './EmailCampaignForm/EmailCampaignAutomationForm';
import { generateFakeId } from '../../../../../utils/FakeIdHelper';
import { QueryResource } from '../../../../../models/datamart/DatamartResource';
import { AddToSegmentAutomationFormProps } from './AddToSegmentNodeForm/AddToSegmentSegmentAutomationForm';
import { DeleteFromSegmentAutomationFormProps } from './DeleteFromSegmentNodeForm/DeleteFromSegmentAutomationForm';
import { ReactToEventAutomationFormProps } from './ReactToEventAutomationForm/ReactToEventAutomationForm';
import { IfNodeFormProps } from './IfNodeForm/IfNodeForm';
import { WaitAutomationFormProps } from './WaitForm/WaitForm';
import { OnSegmentExitInputAutomationFormProps } from './OnSegmentExitInputForm/OnSegmentExitInputAutomationForm';
import { OnSegmentEntryInputAutomationFormProps } from './OnSegmentEntryInputForm/OnSegmentEntryInputAutomationForm';
import { WeekDay } from '../../../../../utils/DateHelper';
import { AudienceSegmentFeedAutomationFormProps } from './AudienceSegmentFeedNodeForm/AudienceSegmentFeedAutomationForm';

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
  day_window?: WeekDay[];
  time_window_start?: Moment;
  time_window_end?: Moment;
}

export const INITIAL_ADD_TO_SEGMENT_NODE_FORM_DATA: AddToSegmentAutomationFormData = {
  processingActivities: [],
  ttl: {
    value: undefined,
    unit: 'days',
  },
};

export const INITIAL_DELETE_FROM_SEGMENT_NODE_FORM_DATA: DeleteFromSegmentAutomationFormData = {
  segmentId: undefined,
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
    name: '',
    editor_version_id: '17',
    editor_version_value: '',
    editor_group_id: '',
    editor_artifact_id: '',
    currency_code: 'EUR',
    technical_name: '',
    type: 'EMAIL',
  },
};

export interface EmailCampaignAutomationFormData
  extends DefaultFormData,
    EmailCampaignFormData {}

export interface AddToSegmentAutomationFormData extends DefaultFormData {
  audienceSegmentName?: string;
  audienceSegmentId?: string;
  processingActivities: ProcessingActivityFieldModel[];
  ttl: {
    value?: string;
    unit: 'days' | 'weeks' | 'months';
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
  uiCreationMode: 'REACT_TO_EVENT_STANDARD' | 'REACT_TO_EVENT_ADVANCED';
}

export interface CustomActionAutomationFormData extends DefaultFormData {
  customActionId?: string;
  editExistingNode?: boolean;
  extendedCustomActionsInformation?: ExtendedCustomActionInformation[];
}

export interface FeedNodeFormData extends DefaultFormData {
  properties: { [key: string]: PropertyResourceShape };
}

export type AutomationFormDataType =
  | DefaultFormData
  | ABNFormData
  | AddToSegmentAutomationFormData
  | DeleteFromSegmentAutomationFormData
  | EmailCampaignAutomationFormData
  | QueryInputAutomationFormData
  | WaitFormData
  | CustomActionAutomationFormData
  | FeedNodeFormData;

export type AutomationFormPropsType =
  | ABNAutomationFormProps
  | DefaultAutomationFormProps
  | EmailCampaignAutomationFormProps
  | AddToSegmentAutomationFormProps
  | DeleteFromSegmentAutomationFormProps
  | ReactToEventAutomationFormProps
  | IfNodeFormProps
  | WaitAutomationFormProps
  | OnSegmentExitInputAutomationFormProps
  | OnSegmentEntryInputAutomationFormProps
  | CustomActionAutomationFormProps
  | AudienceSegmentFeedAutomationFormProps;

export const FORM_ID = 'automationNodeForm';

export function isScenarioNodeShape(
  node: AutomationNodeShape,
): node is ScenarioNodeShape {
  return node.type !== 'DROP_NODE';
}

export function isAbnNode(node: AutomationNodeShape): node is ABNNodeResource {
  return node.type === 'ABN_NODE';
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

export function isInputNode(
  node: AutomationNodeShape,
): node is InputNodeResource {
  return (
    isQueryInputNode(node) ||
    isOnSegmentEntryInputNode(node) ||
    isOnSegmentExitInputNode(node)
  );
}

export function isCustomActionNode(
  node: AutomationNodeShape,
): node is CustomActionNodeResource {
  return (node as CustomActionNodeResource).type === 'CUSTOM_ACTION_NODE';
}

export function isFeedNode(
  node: AutomationNodeShape,
): node is FeedNodeResource {
  return (
    (node as FeedNodeResource).type === 'SCENARIO_AUDIENCE_SEGMENT_FEED_NODE'
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
