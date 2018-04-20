import { BaseFieldProps, Field, GenericField } from 'redux-form';
import FormBoolean, { FormBooleanProps } from './FormBoolean';
import FormCheckbox, { FormCheckboxProps } from './FormCheckbox';
import FormDatePicker, { FormDatePickerProps } from './FormDatePicker';
import FormFieldWrapper from './FormFieldWrapper';
import FormRadioGroup, { FormRadioGroupProps } from './FormRadioGroup';
import FormRangePicker from './FormRangePicker/index';
import FormSection from './FormSection';
import FormTitle from './FormTitle';
import SwitchInput from './SwitchInput';
import FormSwitch, { FormSwitchProps } from './FormSwitch';
import withNormalizer from './withNormalizer';
import withValidators from './withValidators';
import FormUpload from './FormUpload';
import FormTextArea from './FormTextArea';
import FormInput, { FormInputProps } from './FormInput';
import DefaultSelect, { DefaultSelectProps } from './FormSelect/DefaultSelect';
import AddonSelect, { FormSelectAddonProps } from './FormSelect/AddonSelect';
import FormDateRangePicker, { FormDateRangePickerProps } from './FormDateRangePicker';
import FormCodeEdit from './FormCodeEdit';
import FormCodeSnippet from './FormCodeSnippet';
import TagSelect from './FormSelect/TagSelect';
import FormSelect from './FormSelect/FormSelect';
import FormDragAndDrop from './FormDragAndDrop';

export type FieldCtor<T> = React.ComponentClass<BaseFieldProps<T> & T>;

export default {
  FormBoolean,
  FormCheckbox,
  FormDatePicker,
  FormFieldWrapper,
  FormRadioGroup,
  FormRangePicker,
  FormDateRangePicker,
  FormSection,
  FormTextArea,
  FormTitle,
  FormUpload,
  SwitchInput,
  FormSwitch,
  FormInput,
  FormCodeEdit,
  withNormalizer,
  withValidators,
  FormCodeSnippet,
  FormDragAndDrop,
  AddonSelect,
  DefaultSelect,
  TagSelect,
  FormSelect,
};

export {
  FormCheckbox,
  FormDatePicker,
  FormFieldWrapper,
  FormInput,
  FormBoolean,
  FormRadioGroup,
  FormRangePicker,
  FormDateRangePicker,
  FormSection,
  FormTitle,
  SwitchInput,
  FormSwitch,
  FormUpload,
  FormTextArea,
  FormCodeEdit,
  withNormalizer,
  withValidators,
  FormCodeSnippet,
  AddonSelect,
  DefaultSelect,
  TagSelect,
  FormSelect,
  FormDragAndDrop
};

export const FormInputField = Field as new() => GenericField<FormInputProps>;
export const FormDatePickerField = Field as new() => GenericField<FormDatePickerProps>;
export const FormSelectField = Field as new() => GenericField<DefaultSelectProps>;
export const FormAddonSelectField = Field as new() => GenericField<FormSelectAddonProps>;
export const FormSwitchField = Field as new() => GenericField<FormSwitchProps>;
export const FormDateRangePickerField = Field as new() => GenericField<FormDateRangePickerProps>;
export const FormCheckboxField = Field as new() => GenericField<FormCheckboxProps>;
export const FormBooleanField = Field as new() => GenericField<FormBooleanProps>;
export const FormRadioGroupField = Field as new() => GenericField<FormRadioGroupProps>;
