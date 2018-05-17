import * as React from 'react';
import { Field, Validator } from 'redux-form';
import { compose } from 'recompose';

import { Form } from '../../components/index';
import { FormAdLayout, FormStyleSheet, FormDataFile } from './ConnectedFields';
import { ValidatorProps } from '../../components/Form/withValidators';
import { StringPropertyResource } from '../../models/plugin';
import { PluginProperty } from '../../models/Plugins';
import { injectDrawer } from '../../components/Drawer/index';
import { InjectedDrawerProps } from '../../components/Drawer/injectDrawer';

const { FormInput, FormBoolean, FormUpload, withValidators } = Form;

interface AcceptedFilePropertyResource extends StringPropertyResource {
  acceptedFile: string;
}

interface PluginFieldGeneratorProps {
  definition: PluginProperty;
  disabled?: boolean;
  organisationId: string;
  noUploadModal?: () => void; // check type
  pluginVersionId: string;
}

type JoinedProps = PluginFieldGeneratorProps &
  ValidatorProps &
  InjectedDrawerProps;

interface AdditionalInputProps {
  buttonText?: string;
  accept?: any; // type
  options?: any; // type
  noUploadModal?: () => void;
  rows?: number;
  disabled?: boolean;
}

class PluginFieldGenerator extends React.Component<JoinedProps> {
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
    };

    return (
      <Field
        key={`properties.${name}`}
        name={`properties.${name}`}
        component={component}
        validate={validation}
        {...customInputProps}
      />
    );
  };

  generateFielBasedOnDefinition = (
    fieldDefinition: PluginProperty,
    organisationId: string,
  ) => {
    const { fieldValidators: { isValidInteger, isValidDouble } } = this.props;

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
          {
            disabled: this.props.disabled,
            buttonText: 'Upload File',
            accept: '.jpg,.jpeg,.png,.gif',
            noUploadModal: this.props.noUploadModal,
          },
        );
      case 'PIXEL_TAG':
        return this.renderFieldBasedOnConfig(
          FormInput,
          `${fieldDefinition.technical_name}.value.value`,
          fieldDefinition,
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
      default:
        return <div>Please contact your support</div>;
    }
  };

  render() {
    const { definition, organisationId } = this.props;
    return definition && organisationId
      ? this.generateFielBasedOnDefinition(definition, organisationId)
      : null;
  }
}

export default compose<JoinedProps, PluginFieldGeneratorProps>(
  withValidators,
  injectDrawer,
)(PluginFieldGenerator);
