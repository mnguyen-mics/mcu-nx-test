import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Field } from 'redux-form';

import { FormInput, FormTextArea, FormBoolean, FormUpload, withValidators } from '../../components/Form';
import { FormAdLayout, FormStyleSheet } from './ConnectedFields';

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
        isValidUrl,
        isValidNumber,
      }
    } = this.props;

    switch (fieldDefinition.property_type) {
      case 'STRING':
        return this.renderFieldBasedOnConfig(FormInput, `${fieldDefinition.technical_name}.value.value`, fieldDefinition);
      case 'URL':
        return this.renderFieldBasedOnConfig(FormInput, `${fieldDefinition.technical_name}.value.url`, fieldDefinition, [isValidUrl]);
      case 'ASSET':
        return this.renderFieldBasedOnConfig(FormUpload, `${fieldDefinition.technical_name}.value`, fieldDefinition, [], { buttonText: 'Upload File', showUploadList: false, accept: '.jpg,.jpeg,.png,.gif' });
      case 'PIXEL_TAG':
        return this.renderFieldBasedOnConfig(FormTextArea, `${fieldDefinition.technical_name}.value.value`, fieldDefinition, [], { rows: 4 });
      case 'STYLE_SHEET':
        return this.renderFieldBasedOnConfig(FormStyleSheet, `${fieldDefinition.technical_name}.value`, fieldDefinition, [], {}, { disabled: this.props.disabled, rendererVersionId: this.props.rendererVersionId, organisationId: organisationId });
      case 'AD_LAYOUT':
        return this.renderFieldBasedOnConfig(FormAdLayout, `${fieldDefinition.technical_name}.value`, fieldDefinition, [], {}, { disabled: this.props.disabled, rendererVersionId: this.props.rendererVersionId, organisationId: organisationId });
      case 'BOOLEAN':
        return this.renderFieldBasedOnConfig(FormBoolean, `${fieldDefinition.technical_name}.value.value`, fieldDefinition);
      case 'LONG':
        return this.renderFieldBasedOnConfig(FormInput, `${fieldDefinition.technical_name}.value.url`, fieldDefinition, [isValidNumber]);
      case 'DATA_FILE':
        return <div>DATA_FILE</div>;
      case 'MODEL_ID':
        return <div>MODEL_ID</div>;
      case 'DATAMART_ID':
        return <div>DATAMART_ID</div>;
      case 'RECOMMENDER_ID':
        return <div>RECOMMENDER_ID</div>;
      default:
        return <div>default</div>;
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
  rendererVersionId: PropTypes.string.isRequired,
  organisationId: PropTypes.string.isRequired,
};

PluginFieldGenerator = withValidators(PluginFieldGenerator);

export default PluginFieldGenerator;
