import {
  ProcessingResource,
} from './../../../../models/processing';
import {
  PaginationSearchSettings,
  KeywordSearchSettings,
  DatamartSearchSettings,
} from './../../../../utils/LocationSearchHelper';
import { FieldArrayModel } from '../../../../utils/FormHelper';
import { EventRules } from '../../../../models/settings/settings';

export interface Filter
  extends PaginationSearchSettings,
    KeywordSearchSettings,
    DatamartSearchSettings {}

export type VisitAnalyzerFieldModel = FieldArrayModel<{
  visit_analyzer_model_id: string;
}>;

export type EventRuleFieldModel = FieldArrayModel<EventRules>;

export interface EventRulesFormData {
  model: Partial<EventRules>;
  key?: string;
}

export const INITIAL_EVENT_RULES_FORM_DATA: EventRulesFormData = {
  model: {},
};

export type ProcessingActivityFieldModel = FieldArrayModel<ProcessingResource>;