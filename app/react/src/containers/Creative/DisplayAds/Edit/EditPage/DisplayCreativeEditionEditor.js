import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Scrollspy from 'react-scrollspy';
import { Field, reduxForm } from 'redux-form';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { injectIntl, intlShape, FormattedMessage } from 'react-intl';
import { Layout, Form, Row, Button } from 'antd';

import * as actions from '../../../../../state/Notifications/actions';
import { ReactRouterPropTypes } from '../../../../../validators/proptypes';
import { withMcsRouter } from '../../../../Helpers';
import { Actionbar } from '../../../../Actionbar';
import McsIcons from '../../../../../components/McsIcons.tsx';
import { FormInput, FormTitle, FormSelect, withValidators } from '../../../../../components/Form/index.ts';
import AuditComponent from './AuditComponent';
import { PluginFieldGenerator } from '../../../../Plugin';

import messages from '../messages';

const { Content, Sider } = Layout;
const { CustomSelect } = FormSelect;

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


  render() {
    const {
      match: { url },
      intl: { formatMessage },
      handleSubmit,
      submitting,
      fieldValidators: { isRequired },
      breadcrumbPaths,
      formats,
      creative,
      isLoading,
      organisationId
    } = this.props;

    const isDisabled = isLoading || creative.audit_status === 'AUDIT_PASSED';
    return (
      <Layout>
        <Form
          className="edit-layout ant-layout"
          onSubmit={handleSubmit(this.handleSaveDisplayCreative)}
        >
          <Actionbar path={breadcrumbPaths} edition>
            <Button type="primary mcs-primary" htmlType="submit" disabled={submitting}>
              <McsIcons type="plus" />
              <FormattedMessage {...messages.creativeCreationSaveButton} />
            </Button>
            <McsIcons
              type="close"
              className="close-icon"
              style={{ cursor: 'pointer' }}
              onClick={this.props.close}
            />
          </Actionbar>
          <Layout>
            <Sider className="stepper">
              <Scrollspy
                rootEl="#displayCreativesSteps"
                items={['general', 'audit_status', 'properties', 'preview']}
                currentClassName="currentStep"
              >
                <li>
                  <Link to={`${url}#general`}>
                    <McsIcons type="check-rounded-inverted" />
                    <span className="step-title"><FormattedMessage {...messages.creativeSiderMenuGeneralInformation} /></span>
                  </Link>
                </li>
                <li>
                  <Link to={`${url}#audit_status`}>
                    <McsIcons type="check-rounded-inverted" />
                    <span className="step-title"><FormattedMessage {...messages.creativeSiderMenuAudit} /></span>
                  </Link>
                </li>
                <li>
                  <Link to={`${url}#properties`}>
                    <McsIcons type="check-rounded-inverted" />
                    <span className="step-title"><FormattedMessage {...messages.creativeSiderMenuProperties} /></span>
                  </Link>
                </li>
                <li>
                  <Link to={`${url}#preview`}>
                    <McsIcons type="check-rounded-inverted" />
                    <span className="step-title"><FormattedMessage {...messages.creativeSiderMenuPreview} /></span>
                  </Link>
                </li>
              </Scrollspy>
            </Sider>
            <Layout>
              <Content id={'displayCreativesSteps'} className="mcs-content-container mcs-form-container">
                <div id={'general'}>
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
                      component={CustomSelect}
                      validate={[isRequired]}
                      props={{
                        customProps: {
                          label: formatMessage(messages.creativeCreationGeneralFormatFieldButtonCustom),
                          onClick: () => {},
                        },
                        formItemProps: {
                          label: formatMessage(messages.creativeCreationGeneralFormatFieldTitle),
                          required: true,
                          ...fieldGridConfig,
                        },
                        options: formats && formats.map(format => ({
                          key: format,
                          value: format,
                          title: format,
                          disabled: isDisabled
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
                    <AuditComponent creative={creative} onAuditChange={this.props.refreshCreative} />
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
                      return <PluginFieldGenerator key={fieldDef.technical_name} definition={fieldDef} fieldGridConfig={fieldGridConfig} disabled={isDisabled} rendererVersionId={creative.renderer_version_id} organisationId={organisationId} />;
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
          </Layout>
        </Form>
      </Layout>
    );
  }
}

DisplayCreativeEditionEditor.defaultProps = {
  creative: {},
  rendererProperties: [],
  formats: []
};

DisplayCreativeEditionEditor.propTypes = {
  match: ReactRouterPropTypes.match.isRequired,
  intl: intlShape.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  submitting: PropTypes.bool.isRequired,
  fieldValidators: PropTypes.shape().isRequired,
  save: PropTypes.func.isRequired,
  close: PropTypes.func.isRequired,
  breadcrumbPaths: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string.isRequired,
    url: PropTypes.string,
  })).isRequired,
  creative: PropTypes.shape(),
  rendererProperties: PropTypes.arrayOf(PropTypes.shape()),
  formats: PropTypes.arrayOf(PropTypes.string),
  refreshCreative: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
  organisationId: PropTypes.string.isRequired,
  notifyError: PropTypes.func.isRequired,
};

DisplayCreativeEditionEditor = compose(
  withMcsRouter,
  injectIntl,
  reduxForm({
    form: 'creativeEditor',
    enableReinitialize: true,
  }),
  connect(
    undefined,
    { notifyError: actions.notifyError },
  ),
  withValidators,
)(DisplayCreativeEditionEditor);

export default DisplayCreativeEditionEditor;
