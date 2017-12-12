import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Field } from 'redux-form';

import { Form } from '../../components/index.ts';
import { FormAdLayout, FormStyleSheet, FormDataFile } from './ConnectedFields';

const { FormInput, FormTextArea, FormBoolean, FormUpload, withValidators } = Form;

class PluginFieldGenerator extends Component {


  technicalNameToName = (technicalName) => {
    return technicalName.split('_').map((s) => {
      return `${s.charAt(0).toUpperCase()}${s.slice(1)}`;
    }).join(' ');
  }

  renderFieldBasedOnConfig= (component, name, fieldDefinition, validation = [], additionalInputProps = {}, options = {}) => {
    const {
      fieldGridConfig,
      disabled
    } = this.props;

    return (<Field
      key={`properties.${name}`}
      name={`properties.${name}`}
      component={component}
      validate={validation}
      props={{
        formItemProps: {
          label: this.technicalNameToName(fieldDefinition.technical_name),
          ...fieldGridConfig,
        },
        inputProps: {
          placeholder: this.technicalNameToName(fieldDefinition.technical_name),
          disabled: !fieldDefinition.writable || disabled,
          defaultValue: fieldDefinition.value.value,
          ...additionalInputProps,
        },
        buttonText: additionalInputProps.buttonText ? additionalInputProps.buttonText : null,
        accept: additionalInputProps.accept ? additionalInputProps.accept : null,
        options: {
          ...options
        },
        helpToolTipProps: {}
      }}
    />);
  }

  generateFielBasedOnDefinition = (fieldDefinition, organisationId) => {
    const {
      fieldValidators: {
        isValidInteger,
        isValidDouble,
      }
    } = this.props;

    switch (fieldDefinition.property_type) {
      case 'STRING':
        return this.renderFieldBasedOnConfig(FormInput, `${fieldDefinition.technical_name}.value.value`, fieldDefinition);
      case 'URL':
        return this.renderFieldBasedOnConfig(FormInput, `${fieldDefinition.technical_name}.value.url`, fieldDefinition);
      case 'ASSET':
        return this.renderFieldBasedOnConfig(FormUpload, `${fieldDefinition.technical_name}.value`, fieldDefinition, [], { buttonText: 'Upload File', accept: '.jpg,.jpeg,.png,.gif' });
      case 'PIXEL_TAG':
        return this.renderFieldBasedOnConfig(FormTextArea, `${fieldDefinition.technical_name}.value.value`, fieldDefinition, [], { rows: 4 });
      case 'STYLE_SHEET':
        return this.renderFieldBasedOnConfig(FormStyleSheet, `${fieldDefinition.technical_name}.value`, fieldDefinition, [], {}, { disabled: this.props.disabled, pluginVersionId: this.props.pluginVersionId, organisationId: organisationId });
      case 'AD_LAYOUT':
        return this.renderFieldBasedOnConfig(FormAdLayout, `${fieldDefinition.technical_name}.value`, fieldDefinition, [], {}, { disabled: this.props.disabled, pluginVersionId: this.props.pluginVersionId, organisationId: organisationId });
      case 'BOOLEAN':
        return this.renderFieldBasedOnConfig(FormBoolean, `${fieldDefinition.technical_name}.value.value`, fieldDefinition);
      // CHANGE TO IS VALID SCALA LONG
      case 'LONG':
        return this.renderFieldBasedOnConfig(FormInput, `${fieldDefinition.technical_name}.value.value`, fieldDefinition, [isValidDouble]);
      // CHANGE TO IS VALID SCALA INT
      case 'INT':
        return this.renderFieldBasedOnConfig(FormInput, `${fieldDefinition.technical_name}.value.value`, fieldDefinition, [isValidInteger]);
      // CHANGE TO IS VALID SCALA DOUBLE
      case 'DOUBLE':
        return this.renderFieldBasedOnConfig(FormInput, `${fieldDefinition.technical_name}.value.value`, fieldDefinition, [isValidDouble]);
      case 'DATA_FILE':
        return this.renderFieldBasedOnConfig(FormDataFile, `${fieldDefinition.technical_name}.value`, fieldDefinition, [], { buttonText: 'Upload File', accept: '.html,.json,.txt' });
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


    return (definition && organisationId) ? this.generateFielBasedOnDefinition(definition, organisationId) : null;
  }
}

PluginFieldGenerator.defaultProps = {
  disabled: false,
};

PluginFieldGenerator.propTypes = {
  fieldGridConfig: PropTypes.shape({
    labelCol: PropTypes.shape({
      span: PropTypes.number.isRequired,
    }).isRequired,
    wrapperCol: PropTypes.shape({
      span: PropTypes.number.isRequired,
      offset: PropTypes.number.isRequired,
    }).isRequired,
  }).isRequired,
  fieldValidators: PropTypes.shape().isRequired,
  definition: PropTypes.shape().isRequired,
  disabled: PropTypes.bool.isRequired,
  pluginVersionId: PropTypes.string.isRequired,
  organisationId: PropTypes.string.isRequired,
};

PluginFieldGenerator = withValidators(PluginFieldGenerator);

export default PluginFieldGenerator;
