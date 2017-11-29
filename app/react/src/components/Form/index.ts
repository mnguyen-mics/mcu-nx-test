import FormCheckbox from './FormCheckbox';
import FormDatePicker from './FormDatePicker';
import FormFieldWrapper from './FormFieldWrapper';
import FormRadio from './FormRadio';
import FormRadioGroup from './FormRadioGroup';
import FormRangePicker from './FormRangePicker/index';
import FormSection from './FormSection';
import FormSelect from './FormSelect';
import FormSelectAddon from './FormSelectAddon';
import FormTagSelect from './FormTagSelect';
import FormTitle from './FormTitle';
import FormBoolean from './FormBoolean';
import SwitchInput from './SwitchInput';
import withNormalizer from './withNormalizer';
import withValidators from './withValidators';
import FormUpload from './FormUpload';
import FormTextArea from './FormTextArea';
import { BaseFieldProps } from 'redux-form';
import FormInput from './FormInput';

export type FieldCtor<T> = React.ComponentClass<BaseFieldProps<T> & T>;

export default {
  FormCheckbox,
  FormDatePicker,
  FormFieldWrapper,
  FormBoolean,
  FormRadio,
  FormRadioGroup,
  FormRangePicker,
  FormSection,
  FormSelect,
  FormSelectAddon,
  FormTagSelect,
  FormTitle,
  FormUpload,
  FormTextArea,
  SwitchInput,
  FormInput,
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
  FormSelectAddon,
  FormTagSelect,
  FormTitle,
  SwitchInput,
  FormUpload,
  FormTextArea,
  withNormalizer,
  withValidators,
};
