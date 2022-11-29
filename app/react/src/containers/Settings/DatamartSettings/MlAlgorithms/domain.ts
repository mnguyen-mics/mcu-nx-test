import MlAlgorithmResource from '../../../../models/mlAlgorithm/MlAlgorithmResource';
import MlAlgorithmVariableResource from '../../../../models/mlAlgorithmVariable/MlAlgorithmVariableResource';
import { FormLinkedTextInputModel } from '../../../../components/Form/FormProperties';

export const INITIAL_ML_ALGORITHM_FORM_DATA: MlAlgorithmFormData = {
  mlAlgorithm: {
    name: '',
    description: '',
  },
  mlAlgorithmVariables: [],
  mlAlgorithmVariablesKeyValues: [],
};

export interface MlAlgorithmFormData {
  mlAlgorithm: Partial<MlAlgorithmResource>;
  mlAlgorithmVariables: Array<Partial<MlAlgorithmVariableResource>>;
  mlAlgorithmVariablesKeyValues: FormLinkedTextInputModel[];
}
