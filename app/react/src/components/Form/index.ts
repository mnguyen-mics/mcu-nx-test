import { BaseFieldProps, Field, GenericField } from 'redux-form';
import FormBoolean, { FormBooleanProps } from './FormBoolean';
import FormCheckbox from './FormCheckbox';
import FormCheckboxGroup, { FormCheckboxGroupProps } from './FormCheckboxGroup';
import FormDatePicker, { FormDatePickerProps } from './FormDatePicker';
import FormFieldWrapper from './FormFieldWrapper';
import FormRadio, { FormRadioProps } from './FormRadio';
import FormRadioGroup, { FormRadioGroupProps } from './FormRadioGroup';
import FormSection from './FormSection';
import FormTitle from './FormTitle';
import SwitchInput from './SwitchInput';
import FormSwitch, { FormSwitchProps } from './FormSwitch';
import withNormalizer from './withNormalizer';
import withValidators from './withValidators';
import FormUpload, { FormUploadProps } from './FormUpload';
import FormTextArea, { FormTextAreaProps } from './FormTextArea';
import FormInput, { FormInputProps } from './FormInput';
import FormSlider, { FormSliderProps } from './FormSlider';
import DefaultSelect, { DefaultSelectProps } from './FormSelect/DefaultSelect';
import AddonSelect, { FormSelectAddonProps } from './FormSelect/AddonSelect';
import { FormMultiTagProps } from './FormSelect/FormMultiTag';
import FormDateRangePicker, { FormDateRangePickerProps } from './FormDateRangePicker';
import FormCodeEdit, { FormCodeEditProps } from './FormCodeEdit';
import FormCodeSnippet from './FormCodeSnippet';
import TagSelect, { FormTagSelectProps } from './FormSelect/TagSelect';
import FormDragAndDrop from './FormDragAndDrop';
import { CheckboxProps } from 'antd/lib/checkbox';
import FormRate, { FormRateProps } from './FormRate'
import FormAlertInput, { FormAlertInputProps } from './FormAlertInput';
import FormTimePicker, { FormTimePickerProps } from './FormTimePicker';

export type FieldCtor<T> = React.ComponentClass<BaseFieldProps<T> & T>;

export default {
  FormBoolean,
  FormCheckbox,
  FormCheckboxGroup,
  FormDatePicker,
  FormFieldWrapper,
  FormRadio,
  FormRadioGroup,
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
  FormSlider,
  FormRate,
  FormAlertInput,
  FormTimePicker,
};

export {
  FormCheckbox,
  FormCheckboxGroup,
  FormDatePicker,
  FormFieldWrapper,
  FormInput,
  FormBoolean,
  FormRadioGroup,
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
  FormDragAndDrop,
  FormSlider,
  FormRate,
  FormAlertInput,
  FormTimePicker,
};

export const FormInputField = Field as new () => GenericField<FormInputProps>;
export const FormDatePickerField = Field as new () => GenericField<FormDatePickerProps>;
export const FormSelectField = Field as new () => GenericField<DefaultSelectProps>;
export const FormMultiTagField = Field as new () => GenericField<FormMultiTagProps>;
export const FormAddonSelectField = Field as new () => GenericField<FormSelectAddonProps>;
export const FormSwitchField = Field as new () => GenericField<FormSwitchProps>;
export const FormDateRangePickerField = Field as new () => GenericField<FormDateRangePickerProps>;
export const FormCheckboxField = Field as new () => GenericField<CheckboxProps>;
export const FormBooleanField = Field as new () => GenericField<FormBooleanProps>;
export const FormSliderField = Field as new () => GenericField<FormSliderProps>;
export const FormUploadField = Field as new () => GenericField<FormUploadProps>;
export const FormCodeEditField = Field as new () => GenericField<FormCodeEditProps>;
export const FormTextAreaField = Field as new () => GenericField<FormTextAreaProps>;
export const DefaultSelectField = Field as new () => GenericField<DefaultSelectProps>;
export const TagSelectField = Field as new () => GenericField<FormTagSelectProps>;
export const FormRadioField = Field as new () => GenericField<FormRadioProps>;
export const FormRadioGroupField = Field as new () => GenericField<FormRadioGroupProps>;
export const FormCheckboxGroupField = Field as new () => GenericField<FormCheckboxGroupProps>;
export const FormRateField = Field as new() => GenericField<FormRateProps>;
export const FormAlertInputField = Field as new() => GenericField<FormAlertInputProps>;
export const FormTimePickerField = Field as new() => GenericField<FormTimePickerProps>;
