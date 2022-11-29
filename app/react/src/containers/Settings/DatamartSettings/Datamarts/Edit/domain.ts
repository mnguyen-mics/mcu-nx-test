import { Aliases } from '../../../../../models/settings/settings';
import { DatamartResource } from '../../../../../models/datamart/DatamartResource';
import { EventRuleFieldModel } from '../../Common/domain';
import { FieldArrayModel } from '../../../../../utils/FormHelper';

export interface DatamartFormData {
  datamart: Partial<DatamartResource>;
  eventRulesFields: EventRuleFieldModel[];
}

export type AliasesFieldModel = FieldArrayModel<Aliases>;

export const INITIAL_DATAMART_FORM_DATA: DatamartFormData = {
  datamart: {},
  eventRulesFields: [],
};

export interface EditDatamartRouteMatchParam {
  organisationId: string;
  datamartId: string;
}
