import * as React from 'react';
import { compose } from 'recompose';
import { InjectedIntlProps, defineMessages } from 'react-intl';
import {
  FormDataFileField,
  FormDataFile,
} from './ConnectedFields/FormDataFile';
import { ValidatorProps } from '../../components/Form/withValidators';
import { PluginProperty, PluginPresetProperty } from '../../models/Plugins';
import { injectDrawer } from '../../components/Drawer/index';
import { InjectedDrawerProps } from '../../components/Drawer/injectDrawer';
import { PluginLayoutFieldResource } from '../../models/plugin/PluginLayout';
import {
  FormInputField,
  FormUploadField,
  FormInput,
  FormUpload,
  FormBoolean,
  FormCodeEdit,
  FormCodeEditField,
  FormTextAreaField,
  FormTextArea,
  FormSwitch,
  FormSwitchField,
  FormDatePickerField,
  FormDatePicker,
  FormDateRangePickerField,
  FormDateRangePicker,
  FormFieldWrapper,
  FormRadioGroupField,
  FormRadioGroup,
  FormCheckboxGroupField,
  FormCheckboxGroup,
  withValidators,
} from '../../components/Form/index';
import FormSelect, {
  DefaultSelectField,
  TagSelectField,
} from '../../components/Form/';
import { InputProps } from 'antd/lib/input';
import { FormItemProps } from 'antd/lib/form';
import { TooltipProps } from 'antd/lib/tooltip';
import {
  StringPropertyResource,
  PropertyResourceShape,
} from '../../models/plugin';
import { Field, Validator } from 'redux-form';
import FormStyleSheet from './ConnectedFields/FormStyleSheet';
import FormAdLayout from './ConnectedFields/FormAdLayout';
const DefaultSelect = FormSelect.DefaultSelect;
const TagSelect = FormSelect.TagSelect;

interface AcceptedFilePropertyResource extends StringPropertyResource {
  acceptedFile: string;
}
interface PluginFieldGeneratorProps {
  definition: PropertyResourceShape;
  pluginLayoutFieldDefinition?: PluginLayoutFieldResource;
  pluginPresetProperty?: PluginPresetProperty;
  disabled?: boolean;
  organisationId: string;
  noUploadModal?: () => void; // check type
  pluginVersionId: string;
  small?: boolean;
}

type JoinedProps = PluginFieldGeneratorProps &
  ValidatorProps &
  InjectedDrawerProps &
  InjectedIntlProps;

interface AdditionalInputProps {
  buttonText?: string;
  accept?: any; // type
  options?: any; // type
  noUploadModal?: () => void;
  rows?: number;
  disabled?: boolean;
}

interface State {
  nativeDataType: number;
}

class PluginFieldGenerator extends React.Component<JoinedProps, State> {
  constructor(props: JoinedProps) {
    super(props);
    this.state = {
      nativeDataType: 1,
    };
  }

  technicalNameToName = (technicalName: string) => {
    return technicalName
      .split('_')
      .map(s => {
        return `${s.charAt(0).toUpperCase()}${s.slice(1)}`;
      })
      .join(' ');
  };

  renderFieldBasedOnConfig = (
    component: React.ComponentType<any> | 'input' | 'select' | 'textarea',
    name: string,
    fieldDefinition: PluginProperty,
    validation: Validator[] = [],
    warn: Validator[] = [],
    additionalInputProps: AdditionalInputProps = {},
    options = {},
  ) => {
    const { disabled } = this.props;

    const customInputProps = {
      formItemProps: {
        label: this.technicalNameToName(fieldDefinition.technical_name),
      },
      inputProps: {
        placeholder: this.technicalNameToName(fieldDefinition.technical_name),
        disabled: !fieldDefinition.writable || disabled,
        // what if not a StringPropertyResource ?
        defaultValue: (fieldDefinition.value as StringPropertyResource).value,
        ...additionalInputProps,
      },
      buttonText: additionalInputProps.buttonText
        ? additionalInputProps.buttonText
        : undefined,
      accept: additionalInputProps.accept
        ? additionalInputProps.accept
        : undefined,
      options,
      helpToolTipProps: {},
      noUploadModal: additionalInputProps.noUploadModal
        ? additionalInputProps.noUploadModal
        : undefined,
      openNextDrawer: this.props.openNextDrawer,
      closeNextDrawer: this.props.closeNextDrawer,
      small: this.props.small,
    };

    return (
      <div>
        <Field
          key={`properties.${name}`}
          name={`properties.${name}`}
          component={component}
          validate={validation}
          warn={warn}
          {...customInputProps}
        />
      </div>
    );
  };

  handleFieldDefinition = (fieldDefinition: PluginProperty) => {
    const {
      fieldValidators: { isValidInteger, isValidDouble },
      organisationId,
    } = this.props;

    switch (fieldDefinition.property_type) {
      case 'STRING':
        return this.renderFieldBasedOnConfig(
          FormInput,
          `${fieldDefinition.technical_name}.value.value`,
          fieldDefinition,
        );
      case 'URL':
        return this.renderFieldBasedOnConfig(
          FormInput,
          `${fieldDefinition.technical_name}.value.url`,
          fieldDefinition,
        );
      case 'ASSET':
        return this.renderFieldBasedOnConfig(
          FormUpload,
          `${fieldDefinition.technical_name}.value`,
          fieldDefinition,
          [],
          [],
          {
            disabled: this.props.disabled,
            buttonText: 'Upload File',
            accept: '.jpg,.jpeg,.png,.gif,.svg',
            noUploadModal: this.props.noUploadModal,
          },
        );
      case 'ASSET_FILE':
        return this.renderFieldBasedOnConfig(
          FormUpload,
          `${fieldDefinition.technical_name}.value`,
          fieldDefinition,
          [],
          [],
          {
            disabled: this.props.disabled,
            buttonText: 'Upload File',
            accept: '.jpg,.jpeg,.png,.gif,.svg',
            noUploadModal: this.props.noUploadModal,
          },
        );
      case 'ASSET_FOLDER':
        return this.renderFieldBasedOnConfig(
          FormUpload,
          `${fieldDefinition.technical_name}.value`,
          fieldDefinition,
          [],
          [],
          {
            disabled: this.props.disabled,
            buttonText: 'Upload File',
            accept: '.zip',
            noUploadModal: this.props.noUploadModal,
          },
        );
      case 'PIXEL_TAG':
        return this.renderFieldBasedOnConfig(
          FormInput,
          `${fieldDefinition.technical_name}.value.value`,
          fieldDefinition,
          [],
          [],
          { rows: 4 },
          { textArea: true },
        );
      case 'STYLE_SHEET':
        return this.renderFieldBasedOnConfig(
          FormStyleSheet,
          `${fieldDefinition.technical_name}.value`,
          fieldDefinition,
          [],
          [],
          {},
          {
            disabled: this.props.disabled,
            pluginVersionId: this.props.pluginVersionId,
            organisationId: organisationId,
          },
        );
      case 'AD_LAYOUT':
        return this.renderFieldBasedOnConfig(
          FormAdLayout,
          `${fieldDefinition.technical_name}.value`,
          fieldDefinition,
          [],
          [],
          {},
          {
            disabled: this.props.disabled,
            pluginVersionId: this.props.pluginVersionId,
            organisationId: organisationId,
          },
        );
      case 'BOOLEAN':
        return this.renderFieldBasedOnConfig(
          FormBoolean,
          `${fieldDefinition.technical_name}.value.value`,
          fieldDefinition,
        );
      // CHANGE TO IS VALID SCALA LONG
      case 'LONG':
        return this.renderFieldBasedOnConfig(
          FormInput,
          `${fieldDefinition.technical_name}.value.value`,
          fieldDefinition,
          [isValidDouble],
        );
      // CHANGE TO IS VALID SCALA INT
      case 'INT':
        return this.renderFieldBasedOnConfig(
          FormInput,
          `${fieldDefinition.technical_name}.value.value`,
          fieldDefinition,
          [isValidInteger],
        );
      // CHANGE TO IS VALID SCALA DOUBLE
      case 'DOUBLE':
        return this.renderFieldBasedOnConfig(
          FormInput,
          `${fieldDefinition.technical_name}.value.value`,
          fieldDefinition,
          [isValidDouble],
        );
      case 'DATA_FILE':
        return this.renderFieldBasedOnConfig(
          FormDataFile,
          `${fieldDefinition.technical_name}.value`,
          fieldDefinition,
          [],
          [],
          {
            buttonText: 'Upload File',
            accept: (fieldDefinition.value as AcceptedFilePropertyResource)
              .acceptedFile
              ? (fieldDefinition.value as AcceptedFilePropertyResource)
                  .acceptedFile
              : '*',
          },
        );
      case 'MODEL_ID':
        return <div>MODEL_ID</div>;
      case 'DATAMART_ID':
        return <div>DATAMART_ID</div>;
      case 'RECOMMENDER':
        return <div>RECOMMENDER_ID</div>;
      case 'NATIVE_DATA':
        return this.renderFieldBasedOnConfig(
          FormInput,
          `${fieldDefinition.technical_name}.value.value`,
          fieldDefinition,
          this.getErrorValidatorForNativeFieldProperty(
            fieldDefinition.value.type,
          ),
          this.getWarningValidatorForNativeFieldProperty(
            fieldDefinition.value.type,
          ),
        );
      case 'NATIVE_TITLE':
        return this.renderFieldBasedOnConfig(
          FormInput,
          `${fieldDefinition.technical_name}.value.value`,
          fieldDefinition,
        );
      case 'NATIVE_IMAGE':
        return this.renderFieldBasedOnConfig(
          FormUpload,
          `${fieldDefinition.technical_name}.value`,
          fieldDefinition,
          [],
          [],
          {
            disabled: this.props.disabled,
            buttonText: 'Upload File',
            accept: '.jpg,.jpeg,.png,.gif,.svg',
            noUploadModal: this.props.noUploadModal,
          },
        );
      default:
        return <div>Please contact your support</div>;
    }
  };

  generateFieldBasedOnDefinition = (
    fieldDefinition: PluginProperty,
    organisationId: string,
  ): any => {
    const {
      pluginLayoutFieldDefinition,
      pluginPresetProperty,
      disabled,
      fieldValidators: { isRequired },
      small,
      intl,
    } = this.props;

    if (pluginLayoutFieldDefinition !== undefined) {
      const fieldDisabled =
        (!!pluginPresetProperty && !!pluginPresetProperty.value.value) ||
        !fieldDefinition.writable ||
        disabled;

      const pluginFieldProps: {
        formItemProps: FormItemProps;
        inputProps: InputProps;
        helpToolTipProps?: TooltipProps;
        small?: boolean;
      } = {
        inputProps: {
          placeholder: this.technicalNameToName(
            pluginLayoutFieldDefinition.property_technical_name,
          ),
          disabled: fieldDisabled,
        },
        formItemProps: { label: pluginLayoutFieldDefinition.label },
      };

      if (pluginLayoutFieldDefinition.tooltip !== null) {
        pluginFieldProps.helpToolTipProps = {
          title: pluginLayoutFieldDefinition.tooltip,
        };
      }

      if (
        pluginLayoutFieldDefinition.required !== null &&
        pluginLayoutFieldDefinition.required === true
      ) {
        pluginFieldProps.formItemProps.required = true;
      }

      if (small) {
        pluginFieldProps.small = small;
      }

      const helpToolTipProps =
        pluginLayoutFieldDefinition.tooltip !== null
          ? { helpToolTipProps: { title: pluginLayoutFieldDefinition.tooltip } }
          : undefined;

      switch (pluginLayoutFieldDefinition.field_type) {
        case 'TEXTAREA':
          const maxLengthProps =
            pluginLayoutFieldDefinition.max_length !== undefined
              ? {
                  inputProps: {
                    maxLength: pluginLayoutFieldDefinition.max_length,
                  },
                }
              : undefined;
          return (
            <FormTextAreaField
              formItemProps={pluginFieldProps.formItemProps}
              {...maxLengthProps}
              {...helpToolTipProps}
              component={FormTextArea}
              inputProps={{
                disabled: fieldDisabled,
              }}
              validate={
                pluginFieldProps.formItemProps.required === true
                  ? [isRequired]
                  : undefined
              }
              name={`properties.${pluginLayoutFieldDefinition.property_technical_name}.value.value`}
              key={`properties.${pluginLayoutFieldDefinition.property_technical_name}`}
              small={pluginFieldProps.small}
            />
          );
        case 'URL':
          return (
            <FormInputField
              {...pluginFieldProps}
              component={FormInput}
              validate={
                pluginFieldProps.formItemProps.required === true
                  ? [isRequired]
                  : undefined
              }
              name={`properties.${pluginLayoutFieldDefinition.property_technical_name}.value.url`}
              key={`properties.${pluginLayoutFieldDefinition.property_technical_name}`}
            />
          );

        case 'DATA_FILE':
          const dataFileProps: any = {
            buttonText: intl.formatMessage(messages.uploadFileDataFile),
            accept: fieldDefinition.value.acceptedFile,
          };

          return (
            <FormDataFileField
              key={`properties.${pluginLayoutFieldDefinition.property_technical_name}`}
              name={`properties.${pluginLayoutFieldDefinition.property_technical_name}.value`}
              validate={
                pluginFieldProps.formItemProps.required === true
                  ? [isRequired]
                  : undefined
              }
              component={FormDataFile}
              disabled={fieldDisabled}
              {...dataFileProps}
              {...pluginFieldProps}
            />
          );

        case 'HTML':
          return (
            <FormCodeEditField
              key={`properties.${pluginLayoutFieldDefinition.property_technical_name}`}
              name={`properties.${pluginLayoutFieldDefinition.property_technical_name}.value.value`}
              validate={
                pluginFieldProps.formItemProps.required === true
                  ? [isRequired]
                  : undefined
              }
              component={FormCodeEdit}
              formItemProps={pluginFieldProps.formItemProps}
              inputProps={{
                mode: 'html',
                height: '200px',
                showGutter: false,
              }}
              disabled={fieldDisabled}
              helpToolTipProps={pluginFieldProps.helpToolTipProps}
              small={pluginFieldProps.small}
            />
          );

        case 'NUMBER':
          return (
            <FormInputField
              key={`properties.${pluginLayoutFieldDefinition.property_technical_name}`}
              name={`properties.${pluginLayoutFieldDefinition.property_technical_name}.value.value`}
              validate={
                pluginFieldProps.formItemProps.required === true
                  ? [isRequired]
                  : undefined
              }
              component={FormInput}
              {...pluginFieldProps}
              inputProps={{ ...pluginFieldProps.inputProps, type: 'number' }}
            />
          );

        case 'SELECT':
          return (
            <DefaultSelectField
              key={`properties.${pluginLayoutFieldDefinition.property_technical_name}`}
              name={`properties.${pluginLayoutFieldDefinition.property_technical_name}.value.value`}
              validate={
                pluginFieldProps.formItemProps.required === true
                  ? [isRequired]
                  : undefined
              }
              component={DefaultSelect}
              options={
                pluginLayoutFieldDefinition.enum !== undefined
                  ? pluginLayoutFieldDefinition.enum.map(option => {
                      return { value: option.value, title: option.label };
                    })
                  : []
              }
              disabled={fieldDisabled}
              formItemProps={pluginFieldProps.formItemProps}
              helpToolTipProps={pluginFieldProps.helpToolTipProps}
              small={pluginFieldProps.small}
            />
          );

        case 'MULTI_SELECT':
          return (
            <TagSelectField
              key={`properties.${pluginLayoutFieldDefinition.property_technical_name}`}
              name={`properties.${pluginLayoutFieldDefinition.property_technical_name}.value.value`}
              validate={
                pluginFieldProps.formItemProps.required === true
                  ? [isRequired]
                  : undefined
              }
              component={TagSelect}
              selectProps={{
                options:
                  pluginLayoutFieldDefinition.enum !== undefined
                    ? pluginLayoutFieldDefinition.enum
                    : [],
              }}
              disabled={fieldDisabled}
              formItemProps={pluginFieldProps.formItemProps}
              helpToolTipProps={pluginFieldProps.helpToolTipProps}
              valueAsString={true}
              small={pluginFieldProps.small}
            />
          );

        case 'IMAGE':
          return (
            <FormUploadField
              key={`properties.${pluginLayoutFieldDefinition.property_technical_name}`}
              name={`properties.${pluginLayoutFieldDefinition.property_technical_name}.value`}
              validate={
                pluginFieldProps.formItemProps.required === true
                  ? [isRequired]
                  : undefined
              }
              component={FormUpload}
              buttonText={intl.formatMessage(messages.uploadFileImage)}
              noUploadModal={this.props.noUploadModal}
              formItemProps={pluginFieldProps.formItemProps}
              disabled={fieldDisabled}
              helpToolTipProps={pluginFieldProps.helpToolTipProps}
              small={pluginFieldProps.small}
            />
          );

        case 'INPUT':
          return (
            <FormInputField
              key={`properties.${pluginLayoutFieldDefinition.property_technical_name}`}
              name={`properties.${pluginLayoutFieldDefinition.property_technical_name}.value.value`}
              validate={
                pluginFieldProps.formItemProps.required === true
                  ? [isRequired]
                  : undefined
              }
              component={FormInput}
              {...pluginFieldProps}
            />
          );
        case 'INPUT_NUMBER':
          return (
            <FormInputField
              key={`properties.${pluginLayoutFieldDefinition.property_technical_name}`}
              name={`properties.${pluginLayoutFieldDefinition.property_technical_name}.value.value`}
              validate={
                pluginFieldProps.formItemProps.required === true
                  ? [isRequired]
                  : undefined
              }
              component={FormInput}
              {...pluginFieldProps}
              inputProps={{ ...pluginFieldProps.inputProps, type: 'number' }}
            />
          );

        case 'SWITCH':
          return (
            <FormFieldWrapper
              help={pluginFieldProps.formItemProps.help}
              helpToolTipProps={pluginFieldProps.helpToolTipProps}
              validateStatus={pluginFieldProps.formItemProps.validateStatus}
              {...pluginFieldProps.formItemProps}
              small={pluginFieldProps.small}
            >
              <FormSwitchField
                key={`properties.${pluginLayoutFieldDefinition.property_technical_name}`}
                name={`properties.${pluginLayoutFieldDefinition.property_technical_name}.value.value`}
                validate={
                  pluginFieldProps.formItemProps.required === true
                    ? [isRequired]
                    : undefined
                }
                component={FormSwitch}
                disabled={fieldDisabled}
                {...pluginFieldProps}
              />
            </FormFieldWrapper>
          );

        case 'RADIO':
          const elements =
            pluginLayoutFieldDefinition.enum !== undefined
              ? pluginLayoutFieldDefinition.enum.map(el => {
                  return { id: el.value, value: el.value, title: el.label };
                })
              : [];

          return (
            <FormFieldWrapper
              help={pluginFieldProps.formItemProps.help}
              helpToolTipProps={pluginFieldProps.helpToolTipProps}
              validateStatus={pluginFieldProps.formItemProps.validateStatus}
              {...pluginFieldProps.formItemProps}
              small={pluginFieldProps.small}
            >
              <FormRadioGroupField
                key={`properties.${pluginLayoutFieldDefinition.property_technical_name}`}
                name={`properties.${pluginLayoutFieldDefinition.property_technical_name}.value.value`}
                validate={
                  pluginFieldProps.formItemProps.required === true
                    ? [isRequired]
                    : undefined
                }
                component={FormRadioGroup}
                elements={elements}
                disabled={fieldDisabled}
                {...pluginFieldProps}
              />
            </FormFieldWrapper>
          );

        case 'CHECKBOX':
          const options =
            pluginLayoutFieldDefinition.enum !== undefined
              ? pluginLayoutFieldDefinition.enum
              : [];

          return (
            <FormFieldWrapper
              help={pluginFieldProps.formItemProps.help}
              helpToolTipProps={pluginFieldProps.helpToolTipProps}
              validateStatus={pluginFieldProps.formItemProps.validateStatus}
              {...pluginFieldProps.formItemProps}
              small={pluginFieldProps.small}
            >
              <FormCheckboxGroupField
                key={`properties.${pluginLayoutFieldDefinition.property_technical_name}`}
                name={`properties.${pluginLayoutFieldDefinition.property_technical_name}.value.value`}
                validate={
                  pluginFieldProps.formItemProps.required === true
                    ? [isRequired]
                    : undefined
                }
                component={FormCheckboxGroup}
                options={options}
                valueAsString={true}
                disabled={fieldDisabled}
                {...pluginFieldProps}
              />
            </FormFieldWrapper>
          );

        case 'DATE':
          return (
            <FormDatePickerField
              key={`properties.${pluginLayoutFieldDefinition.property_technical_name}`}
              name={`properties.${pluginLayoutFieldDefinition.property_technical_name}.value.value`}
              validate={
                pluginFieldProps.formItemProps.required === true
                  ? [isRequired]
                  : undefined
              }
              component={FormDatePicker}
              datePickerProps={{}}
              isoDate={true}
              disabled={fieldDisabled}
              {...pluginFieldProps}
            />
          );

        case 'DATE_RANGE':
          return (
            <FormDateRangePickerField
              key={`properties.${pluginLayoutFieldDefinition.property_technical_name}`}
              name={`properties.${pluginLayoutFieldDefinition.property_technical_name}.value.value`}
              validate={
                pluginFieldProps.formItemProps.required === true
                  ? [isRequired]
                  : undefined
              }
              component={FormDateRangePicker}
              startDatePickerProps={{}}
              endDatePickerProps={{}}
              disabled={fieldDisabled}
              {...pluginFieldProps}
            />
          );

        default:
          return this.handleFieldDefinition(fieldDefinition);
      }
    } else {
      return this.handleFieldDefinition(fieldDefinition);
    }
  };

  /***** Data Asset Types Validators 
    See https://www.iab.com/wp-content/uploads/2017/04/OpenRTB-Native-Ads-Specification-Draft_1.2_2017-04.pdf
    At page 39 --> 7.6 Data Asset Types
  *****/

  getErrorValidatorForNativeFieldProperty = (type: number) => {
    const {
      fieldValidators: { isRequired, isValidInteger },
    } = this.props;
    switch (type) {
      case 1:
      case 2:
        return [isRequired];
      case 4:
      case 5:
      case 6:
      case 7:
        return [isValidInteger];
      default:
        return [];
    }
  };

  getWarningValidatorForNativeFieldProperty = (type: number) => {
    const {
      fieldValidators: { isCharLengthLessThan, isIntegerBetween },
    } = this.props;
    switch (type) {
      case 1:
        return [isCharLengthLessThan(25)];
      case 2:
        return [isCharLengthLessThan(140)];
      case 3:
        return [isIntegerBetween(0, 5)];
      case 12:
        return [isCharLengthLessThan(15)];
      default:
        return [];
    }
  };

  render() {
    const { definition, organisationId } = this.props;
    return (
      definition &&
      organisationId &&
      this.generateFieldBasedOnDefinition(definition, organisationId)
    );
  }
}

export default compose<JoinedProps, PluginFieldGeneratorProps>(
  withValidators,
  injectDrawer,
)(PluginFieldGenerator);

const messages = defineMessages({
  uploadFileDataFile: {
    id: 'pluginField-DataFile-uploadFile',
    defaultMessage: 'Upload File',
  },
  uploadFileImage: {
    id: 'pluginField-DataFile-image',
    defaultMessage: 'Upload File',
  },
  uploadFileAsset: {
    id: 'fieldDefinition-DataFile-asset',
    defaultMessage: 'Upload File',
  },
  uploadFileDataFile2: {
    id: 'fieldDefinition-DataFile-uploadFile',
    defaultMessage: 'Upload File',
  },
});
