import FormBoolean from './FormBoolean';
import FormCheckbox from './FormCheckbox';
import FormDatePicker, { FormDatePickerProps } from './FormDatePicker';
import FormFieldWrapper from './FormFieldWrapper';
import FormRadio from './FormRadio';
import FormRadioGroup from './FormRadioGroup';
import FormRangePicker from './FormRangePicker/index';
import FormSection from './FormSection';
import FormSelect from './FormSelect';
import FormTitle from './FormTitle';
import SwitchInput from './SwitchInput';
import FormSwitch, { FormSwitchProps } from './FormSwitch';
import withNormalizer from './withNormalizer';
import withValidators from './withValidators';
import FormUpload from './FormUpload';
import FormTextArea from './FormTextArea';
import { BaseFieldProps, Field, GenericField } from 'redux-form';
import FormInput, { FormInputProps } from './FormInput';
import { DefaultSelectProps } from './FormSelect/DefaultSelect';
import { FormSelectAddonProps } from './FormSelect/AddonSelect';
import FormDateRangePicker, { FormDateRangePickerProps } from './FormDateRangePicker';

export type FieldCtor<T> = React.ComponentClass<BaseFieldProps<T> & T>;

export default {
  FormBoolean,
  FormCheckbox,
  FormDatePicker,
  FormFieldWrapper,
  FormRadio,
  FormRadioGroup,
  FormRangePicker,
  FormDateRangePicker,
  FormSection,
  FormSelect,
  FormTextArea,
  FormTitle,
  FormUpload,
  SwitchInput,
  FormSwitch,
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
  FormDateRangePicker,
  FormSection,
  FormSelect,
  FormTitle,
  SwitchInput,
  FormSwitch,
  FormUpload,
  FormTextArea,
  withNormalizer,
  withValidators,
};

export const FormInputField = Field as new() => GenericField<FormInputProps>;
export const FormDatePickerField = Field as new() => GenericField<FormDatePickerProps>;
export const FormSelectField = Field as new() => GenericField<DefaultSelectProps>;
export const FormAddonSelectField = Field as new() => GenericField<FormSelectAddonProps>;
export const FormSwitchField = Field as new() => GenericField<FormSwitchProps>;
export const FormDateRangePickerField = Field as new() => GenericField<FormDateRangePickerProps>;
