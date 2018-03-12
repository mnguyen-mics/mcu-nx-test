import { BaseFieldProps, Field, GenericField } from 'redux-form';
import FormBoolean, { FormBooleanProps } from './FormBoolean';
import FormCheckbox from './FormCheckbox';
import FormDatePicker, { FormDatePickerProps } from './FormDatePicker';
import FormFieldWrapper from './FormFieldWrapper';
import FormRadio from './FormRadio';
import FormRadioGroup from './FormRadioGroup';
import FormRangePicker from './FormRangePicker/index';
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
import TagSelect from './FormSelect/TagSelect';
import FormDragAndDrop from './FormDragAndDrop';
import { CheckboxProps } from 'antd/lib/checkbox';
import FormRate, { FormRateProps } from './FormRate'

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
  FormRate
};

export const FormInputField = Field as new() => GenericField<FormInputProps>;
export const FormDatePickerField = Field as new() => GenericField<FormDatePickerProps>;
export const FormSelectField = Field as new() => GenericField<DefaultSelectProps>;
export const FormMultiTagField = Field as new() => GenericField<FormMultiTagProps>;
export const FormAddonSelectField = Field as new() => GenericField<FormSelectAddonProps>;
export const FormSwitchField = Field as new() => GenericField<FormSwitchProps>;
export const FormDateRangePickerField = Field as new() => GenericField<FormDateRangePickerProps>;
export const FormCheckboxField = Field as new() => GenericField<CheckboxProps>;
export const FormBooleanField = Field as new() => GenericField<FormBooleanProps>;
export const FormSliderField = Field as new() => GenericField<FormSliderProps>;
export const FormRateField = Field as new() => GenericField<FormRateProps>;

export const FormUploadField = Field as new() => GenericField<FormUploadProps>;
export const FormCodeEditField = Field as new() => GenericField<FormCodeEditProps>;
export const FormTextAreaField = Field as new() => GenericField<FormTextAreaProps>;
