import FormBoolean from './FormBoolean';
import FormCheckbox from './FormCheckbox';
import FormDatePicker from './FormDatePicker';
import FormFieldWrapper from './FormFieldWrapper';
import FormRadio from './FormRadio';
import FormRadioGroup from './FormRadioGroup';
import FormRangePicker from './FormRangePicker/index';
import FormSection from './FormSection';
import FormSelect from './FormSelect';
import FormTitle from './FormTitle';
import SwitchInput from './SwitchInput';
import withNormalizer from './withNormalizer';
import withValidators from './withValidators';
import FormUpload from './FormUpload';
import FormTextArea from './FormTextArea';
import { BaseFieldProps } from 'redux-form';
import FormInput from './FormInput';
import FormCodeEdit from './FormCodeEdit';
import formErrorMessage from './formErrorMessage';

export type FieldCtor<T> = React.ComponentClass<BaseFieldProps<T> & T>;

export default {
  FormBoolean,
  FormCheckbox,
  FormDatePicker,
  FormFieldWrapper,
  FormRadio,
  FormRadioGroup,
  FormRangePicker,
  FormSection,
  FormSelect,
  FormTextArea,
  FormTitle,
  FormUpload,
  formErrorMessage,
  SwitchInput,
  FormInput,
  FormCodeEdit,
  withNormalizer,
  withValidators,
};

export {
  FormCheckbox,
  FormDatePicker,
  FormFieldWrapper,
  FormInput,
  FormBoolean,
  FormRadio,
  FormRadioGroup,
  FormRangePicker,
  FormSection,
  FormSelect,
  FormTitle,
  SwitchInput,
  FormUpload,
  FormTextArea,
  formErrorMessage,
  FormCodeEdit,
  withNormalizer,
  withValidators,
};
