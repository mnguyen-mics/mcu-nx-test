import { FieldArrayModel } from "../../../../utils/FormHelper";
import { EventRules } from "../../../../models/settings/settings";

export interface Filter {
  currentPage: number;
  pageSize: number;
  name: string;
}

export type VisitAnalyzerFieldModel = FieldArrayModel<{
  visit_analyzer_model_id: string;
}>;


export type EventRuleFieldModel = FieldArrayModel<EventRules>;


export interface EventRulesFormData {
  model: Partial<EventRules>;
  key?: string;
}


export const INITIAL_EVENT_RULES_FORM_DATA: EventRulesFormData = {
  model: {
  },
};

