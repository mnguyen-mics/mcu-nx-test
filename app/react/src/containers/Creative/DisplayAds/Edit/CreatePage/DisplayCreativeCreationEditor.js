import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Field, reduxForm, Form } from 'redux-form';
import { compose } from 'recompose';
import { injectIntl, intlShape } from 'react-intl';
import { Layout, Row } from 'antd';

import { withMcsRouter } from '../../../../Helpers';
import { FormInput, FormTitle, FormSelect, withValidators, formErrorMessage } from '../../../../../components/Form/index.ts';
import { PluginFieldGenerator } from '../../../../Plugin';

import messages from '../messages';

const { Content } = Layout;

const fieldGridConfig = {
  labelCol: { span: 3 },
  wrapperCol: { span: 10, offset: 1 },
};

class DisplayCreativeCreationEditor extends Component {

  componentWillReceiveProps(nextProps) {
    if (nextProps.submitFailed && (this.props.submitFailed !== nextProps.submitFailed)) {
      const {
        intl: {
          formatMessage
        }
      } = this.props;
      formErrorMessage(formatMessage(messages.errorFormMessage));
    }
  }

  onSubmit = formValues => {
    const { save } = this.props;

    const creativeData = {
      ...formValues.creative,
    };

    const formattedProperties = this.props.rendererProperties.filter(item => {
      return item.writable === true;
    }).map(item => {
      return {
        ...item,
        value: formValues.properties[item.technical_name] ? formValues.properties[item.technical_name].value : item.value
      };
    });

    const rendererData = {
      renderer_artifact_id: this.props.adRenderer.artifactId,
      renderer_group_id: this.props.adRenderer.groupId,
    };

    save(creativeData, formattedProperties, rendererData);
  }

  render() {
    const {
      intl: { formatMessage },
      handleSubmit,
      fieldValidators: { isRequired },
      isLoading,
      adRenderer: {
        versionId
      },
      formats,
      organisationId,
      formId,
    } = this.props;

    const pluginFieldGenerated = this.props.rendererProperties.map(fieldDef => {
      return <PluginFieldGenerator key={`${fieldDef.technical_name}`} definition={fieldDef} fieldGridConfig={fieldGridConfig} disabled={isLoading} rendererVersionId={versionId} organisationId={organisationId} />;
    });
    return (
      <Layout>
        <Form
          id="creativeEditor"
          className="edit-layout ant-layout"
          onSubmit={handleSubmit(this.onSubmit)}
        >
          <Layout>
            <Content id={formId} className="mcs-content-container mcs-form-container">
              <div id={'general_infos'}>
                <Row type="flex" align="middle" justify="space-between" className="section-header">
                  <FormTitle
                    title={messages.creativeSectionGeneralTitle}
                    subTitle={messages.creativeSectionGeneralSubTitle}
                  />
                </Row>
                <Row>
                  <Field
                    name="creative.name"
                    component={FormInput}
                    validate={[isRequired]}
                    props={{
                      formItemProps: {
                        label: formatMessage(messages.creativeCreationGeneralNameFieldTitle),
                        required: true,
                        ...fieldGridConfig,
                      },
                      inputProps: {
                        placeholder: formatMessage(messages.creativeCreationGeneralNameFieldPlaceHolder),
                        disabled: isLoading,
                      },
                      helpToolTipProps: {
                        title: formatMessage(messages.creativeCreationGeneralNameFieldHelper),
                      },
                    }}
                  />
                  <Field
                    name="creative.format"
                    component={FormSelect}
                    validate={[isRequired]}
                    props={{
                      formItemProps: {
                        label: formatMessage(messages.creativeCreationGeneralFormatFieldTitle),
                        required: true,
                        ...fieldGridConfig,
                      },
                      selectProps: {
                        defaultValue: formats[0]
                      },
                      inputProps: {
                        disabled: isLoading,
                        defaultValue: formats[0]
                      },
                      options: formats && formats.map(format => ({
                        key: format,
                        value: format,
                        title: format,
                      })),
                      helpToolTipProps: {
                        title: formatMessage(messages.creativeCreationGeneralFormatFieldHelper),
                      },
                    }}
                  />
                  <Field
                    name="creative.destination_domain"
                    component={FormInput}
                    validate={[isRequired]}
                    props={{
                      formItemProps: {
                        label: formatMessage(messages.creativeCreationGeneralDomainFieldTitle),
                        required: true,
                        ...fieldGridConfig,
                      },
                      inputProps: {
                        placeholder: formatMessage(messages.creativeCreationGeneralDomainFieldPlaceHolder),
                        disabled: isLoading,
                      },
                      helpToolTipProps: {
                        title: formatMessage(messages.creativeCreationGeneralDomainFieldHelper),
                      },
                    }}
                  />
                </Row>
              </div>
              <hr />
              <div id={'properties'}>
                <Row type="flex" align="middle" justify="space-between" className="section-header">
                  <FormTitle
                    title={messages.creativeSectionPropertyTitle}
                    subTitle={messages.creativeSectionPropertySubTitle}
                  />
                </Row>
                <Row>
                  { pluginFieldGenerated }
                </Row>
              </div>
            </Content>
          </Layout>
        </Form>
      </Layout>
    );
  }
}

DisplayCreativeCreationEditor.defaultProps = {
  blasts: [],
  campaignName: '',
  submitFailed: false,
};

DisplayCreativeCreationEditor.propTypes = {
  intl: intlShape.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  fieldValidators: PropTypes.shape().isRequired,
  save: PropTypes.func.isRequired,
  adRenderer: PropTypes.shape({
    id: PropTypes.number.isRequired,
    versionId: PropTypes.string.isRequired,
    artifactId: PropTypes.string.isRequired,
    groupId: PropTypes.string.isRequired,
  }).isRequired,
  formats: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
  rendererProperties: PropTypes.arrayOf(PropTypes.shape().isRequired).isRequired,
  isLoading: PropTypes.bool.isRequired,
  organisationId: PropTypes.string.isRequired,
  formId: PropTypes.string.isRequired,
  submitFailed: PropTypes.bool,
};

DisplayCreativeCreationEditor = compose(
  injectIntl,
  withMcsRouter,
  reduxForm({
    form: 'creativeEditor',
    enableReinitialize: true,
  }),
  withValidators,
)(DisplayCreativeCreationEditor);

export default DisplayCreativeCreationEditor;
