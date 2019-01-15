import { AutomationResource } from '../../../models/automations/automations';
import { StorylineNodeModel } from '../Builder/domain';

export interface EditAutomationParam {
  organisationId: string;
  automationId?: string;
}

export interface AutomationFormData {
  automation: Partial<AutomationResource>;
  automationTreeData?: StorylineNodeModel;
}

export const INITIAL_AUTOMATION_DATA: AutomationFormData = {
  automation: {},
};
