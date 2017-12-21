import * as React from 'react';
import { Field, Validator } from 'redux-form';
import { compose } from 'recompose';

import { Form } from '../../components/index';
import { FieldCtor } from '../../components/Form';
import { FormInputProps } from '../../components/Form/FormInput';
import { FormAdLayout, FormStyleSheet, FormDataFile } from './ConnectedFields';
import { FieldValidatorsProps, ValidatorProps } from '../../components/Form/withValidators';
import { PropertyResourceShape } from '../../models/plugin';
import { FormTextArea } from '../../components/Form/FormTextArea';

const { FormInput, FormTextArea, FormBoolean, FormUpload, withValidators } = Form;

interface PluginFieldGeneratorProps {
  fieldGridConfig: {
    labelCol: {
      span: number;
    };
    wrapperCol: {
      span: number;
      offset: number;
    }
  };
  fieldValidators?: FieldValidatorsProps;
  definition: PropertyResourceShape;
  disabled?: boolean;
  pluginVersionId?: string;
  organisationId: string;
  noUploadModal?: () => void; // check type
  rendererVersionId: string;
}

type JoinedProps = PluginFieldGeneratorProps & ValidatorProps & FieldValidatorsProps;

interface AdditionalInputProps {
  buttonText?: string;
  accept?: any; // type
  options?: any; // type
  noUploadModal?: () => void;
  rows?: number;
}

type CustomInputProps = FormInputProps & AdditionalInputProps;

class PluginFieldGenerator extends React.Component<JoinedProps> {

  static defaultProps: Partial<PluginFieldGeneratorProps> = {
    noUploadModal: undefined,
    disabled: false,
    pluginVersionId: '',
  };

  technicalNameToName = (technicalName: string) => {
    return technicalName.split('_').map((s) => {
      return `${s.charAt(0).toUpperCase()}${s.slice(1)}`;
    }).join(' ');
  }

  renderFieldBasedOnConfig =
  (component: React.ComponentType<any> | 'input' | 'select' | 'textarea',
    // React.ComponentType<FormInputProps>
    // | React.ComponentType<FormUploadProps>
    // | React.ComponentType<FormTextArea>
    // | React.ComponentType<FormStyleSheetProps>
    // | React.ComponentType< FormAdLayoutProps>
    // | React.ComponentType<FormBooleanProps>
    // | React.ComponentType<FormDatafileProps>,
   name: string,
   fieldDefinition: PropertyResourceShape,
   validation: Validator[] = [],
   additionalInputProps: AdditionalInputProps = {},
   options = {},
  ) => {
    const {
      fieldGridConfig,
      disabled,
    } = this.props;

    const InputField: FieldCtor<CustomInputProps> = Field;
    const customInputProps: CustomInputProps = {
      formItemProps: {
        label: this.technicalNameToName(fieldDefinition.technical_name),
        ...fieldGridConfig,
      },
      inputProps: {
        // placeholder: this.technicalNameToName(fieldDefinition.technical_name),
        disabled: !fieldDefinition.writable || disabled,
        // defaultValue: fieldDefinition.value.value,
        ...additionalInputProps,
      },
      buttonText: additionalInputProps.buttonText ? additionalInputProps.buttonText : undefined,
      accept: additionalInputProps.accept ? additionalInputProps.accept : undefined,
      options: {
        ...options,
      },
      helpToolTipProps: {},
      noUploadModal: additionalInputProps.noUploadModal ? additionalInputProps.noUploadModal : undefined,
    };

    return (
      <InputField
        key={`properties.${name}`}
        name={`properties.${name}`}
        component={component}
        validate={validation}
        {...customInputProps}
      />
    );
  }

  generateFielBasedOnDefinition = (fieldDefinition: PropertyResourceShape, organisationId: string) => {
    const {
      fieldValidators: {
        isValidInteger,
        isValidDouble,
      },
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
          { buttonText: 'Upload File', accept: '.jpg,.jpeg,.png,.gif', noUploadModal: this.props.noUploadModal },
        );
      case 'PIXEL_TAG':
        return this.renderFieldBasedOnConfig(
          FormTextArea,
          `${fieldDefinition.technical_name}.value.value`,
          fieldDefinition,
          [],
          { rows: 4 },
        );
      case 'STYLE_SHEET':
        return this.renderFieldBasedOnConfig(
          FormStyleSheet,
          `${fieldDefinition.technical_name}.value`,
          fieldDefinition,
          [],
          {},
          { disabled: this.props.disabled, pluginVersionId: this.props.pluginVersionId, organisationId: organisationId },
        );
      case 'AD_LAYOUT':
        return this.renderFieldBasedOnConfig(
          FormAdLayout,
          `${fieldDefinition.technical_name}.value`,
          fieldDefinition,
          [],
          {},
          { disabled: this.props.disabled, pluginVersionId: this.props.pluginVersionId, organisationId: organisationId },
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
          { buttonText: 'Upload File', accept: '.html,.json,.txt' },
        );
      case 'MODEL_ID':
        return <div>MODEL_ID</div>;
      case 'DATAMART_ID':
        return <div>DATAMART_ID</div>;
      case 'RECOMMENDER_ID':
        return <div>RECOMMENDER_ID</div>;
      default:
        return <div>Please contact your support</div>;
    }
  }

  render() {
    const {
      definition,
      organisationId,
    } = this.props;
    return (definition && organisationId) ?
    this.generateFielBasedOnDefinition(definition, organisationId) :
    null;
  }
}

export default compose<JoinedProps, PluginFieldGeneratorProps>(
  withValidators,
)(PluginFieldGenerator);
