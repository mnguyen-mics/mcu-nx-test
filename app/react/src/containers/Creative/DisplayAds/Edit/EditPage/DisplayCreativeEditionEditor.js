import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Field, reduxForm, Form } from 'redux-form';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { injectIntl, intlShape } from 'react-intl';
import { Layout, Row, Modal } from 'antd';

import * as actions from '../../../../../state/Notifications/actions';
import { withMcsRouter } from '../../../../Helpers';
import { FormInput, FormTitle, FormSelect, withValidators, formErrorMessage } from '../../../../../components/Form/index.ts';
import AuditComponent from './AuditComponent';
import { PluginFieldGenerator } from '../../../../Plugin';
import { Card } from '../../../../../components/Card/index.ts';
import modalMessages from '../../../../../common/messages/modalMessages';

import messages from '../messages';

const { Content } = Layout;

const fieldGridConfig = {
  labelCol: { span: 3 },
  wrapperCol: { span: 10, offset: 1 },
};

const configuration = {
  ADS_PREVIEW_URL: '//ads.mediarithmics.com/ads/render'
};

class DisplayCreativeEditionEditor extends Component {

  state = {
    formats: [],
    rendererProperties: [],
    creative: {},
  };

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

  handleSaveDisplayCreative = formValues => {
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

    save(creativeData, formattedProperties);
  }

  formatDimension = (format) => {
    if (format) {
      return {
        width: parseInt(format.split('x')[0], 10),
        height: parseInt(format.split('x')[1], 10),
      };
    }
    return {
      width: null,
      height: null
    };
  }

  renderIframeCreative = () => {
    const {
      creative,
      rendererProperties,
      notifyError
    } = this.props;

    let tagType = 'iframe';
    if (rendererProperties.length) {
      try {
        tagType = rendererProperties.find((prop) => { return prop.technical_name === 'tag_type'; }).value.value || 'iframe';
      } catch (e) {
        notifyError(e);
      }
    }

    let previewUrl = `${configuration.ADS_PREVIEW_URL}?ctx=PREVIEW&rid=${creative.id}&caid=preview`;
    if (tagType === 'script') {
      previewUrl = `data:text/html;charset=utf-8,${encodeURI(`<html><body style="margin-left: 0%; margin-right: 0%; margin-top: 0%; margin-bottom: 0%"><script type="text/javascript" src="https:${configuration.ADS_PREVIEW_URL}?ctx=PREVIEW&rid=${creative.id}&caid=preview"></script></body></html>`)}`;
    }

    return previewUrl;
  }

  noUploadModal = () => {
    const {
      intl: {
        formatMessage,
      },
      creative,
    } = this.props;
    Modal.warning({
      title: formatMessage(modalMessages.noActionTitle),
      content: creative.audit_status === 'AUDIT_PASSED' ? formatMessage(modalMessages.noUploadMessage) : formatMessage(modalMessages.noUpdateMessage),
      iconType: 'exclamation-circle',
      okText: formatMessage(modalMessages.confirm),
    });
  }

  render() {
    const {
      intl: { formatMessage },
      handleSubmit,
      fieldValidators: { isRequired },
      formats,
      creative,
      isLoading,
      organisationId,
      formId,
    } = this.props;


    const isDisabled = isLoading || creative.audit_status === 'AUDIT_PASSED' || creative.audit_status === 'AUDIT_PENDING';
    return (
      <Layout>
        <Form
          className="edit-layout ant-layout"
          onSubmit={handleSubmit(this.handleSaveDisplayCreative)}
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
                        disabled: isDisabled
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
                      options: formats && formats.map(format => ({
                        key: format,
                        value: format,
                        title: format,
                      })),
                      helpToolTipProps: {
                        title: formatMessage(messages.creativeCreationGeneralFormatFieldHelper),
                      },
                      disabled: isDisabled,
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
                        defaultValue: this.state.creative && this.state.creative.name,
                        disabled: isDisabled
                      },
                      helpToolTipProps: {
                        title: formatMessage(messages.creativeCreationGeneralDomainFieldHelper),
                      },
                    }}
                  />
                </Row>
              </div>
              <hr />
              <div id={'audit_status'}>
                <Row type="flex" align="middle" justify="space-between" className="section-header">
                  <FormTitle
                    title={messages.creativeSectionAuditTitle}
                    subTitle={messages.creativeSectionAuditSubTitle}
                  />
                </Row>
                <Row>
                  <Card>
                    <AuditComponent creative={creative} onAuditChange={this.props.refreshCreative} mode="card" />
                  </Card>
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
                  {this.props.rendererProperties && this.props.rendererProperties.length && this.props.rendererProperties.map(fieldDef => {
                    return (
                      <PluginFieldGenerator
                        key={fieldDef.technical_name}
                        definition={fieldDef}
                        fieldGridConfig={fieldGridConfig}
                        disabled={isDisabled}
                        rendererVersionId={creative.renderer_version_id}
                        organisationId={organisationId}
                        noUploadModal={this.noUploadModal}
                      />
                    );
                  })}
                </Row>
              </div>
              <hr />
              <div id={'preview'}>
                <Row type="flex" align="middle" justify="space-between" className="section-header">
                  <FormTitle
                    title={messages.creativeSectionPreviewTitle}
                    subTitle={messages.creativeSectionPreviewSubTitle}
                  />
                </Row>
                <Row>
                  <iframe className="renderer" src={this.renderIframeCreative()} frameBorder="0" scrolling="no" width={this.formatDimension(this.props.creative.format).width} height={this.formatDimension(this.props.creative.format).height} />
                </Row>
              </div>
            </Content>
          </Layout>
        </Form>
      </Layout>
    );
  }
}

DisplayCreativeEditionEditor.defaultProps = {
  creative: {},
  rendererProperties: [],
  formats: [],
  submitFailed: false,
};

DisplayCreativeEditionEditor.propTypes = {
  intl: intlShape.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  fieldValidators: PropTypes.shape().isRequired,
  save: PropTypes.func.isRequired,
  creative: PropTypes.shape(),
  rendererProperties: PropTypes.arrayOf(PropTypes.shape()),
  formats: PropTypes.arrayOf(PropTypes.string),
  refreshCreative: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
  organisationId: PropTypes.string.isRequired,
  notifyError: PropTypes.func.isRequired,
  formId: PropTypes.string.isRequired,
  submitFailed: PropTypes.bool,
};

DisplayCreativeEditionEditor = compose(
  withMcsRouter,
  injectIntl,
  reduxForm({
    form: 'creativeEditionForm',
    enableReinitialize: true,
  }),
  connect(
    undefined,
    { notifyError: actions.notifyError },
  ),
  withValidators,
)(DisplayCreativeEditionEditor);

export default DisplayCreativeEditionEditor;
