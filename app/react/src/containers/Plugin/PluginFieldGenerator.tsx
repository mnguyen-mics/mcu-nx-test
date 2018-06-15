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

  generateFielBasedOnDefinition = (
    fieldDefinition: PluginProperty,
    organisationId: string,
  ) => {
    const {
      fieldValidators: { isValidInteger, isValidDouble },
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
            accept: '.jpg,.jpeg,.png,.gif',
            noUploadModal: this.props.noUploadModal,
          },
        );
      default:
        return <div>Please contact your support</div>;
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
      this.generateFielBasedOnDefinition(definition, organisationId)
    );
  }
}

export default compose<JoinedProps, PluginFieldGeneratorProps>(
  withValidators,
  injectDrawer,
)(PluginFieldGenerator);
