import { AutomationResource } from '../../../models/automations/automations';

export interface EditAutomationParam {
  organisationId: string;
  automationId?: string;
}

export interface AutomationFormData {
  automation: Partial<AutomationResource>;
}

export const INITIAL_AUTOMATION_DATA: AutomationFormData = {
  automation: {},
};
