import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Scrollspy from 'react-scrollspy';
import { Field, reduxForm } from 'redux-form';
import { compose } from 'recompose';
import { injectIntl, intlShape, FormattedMessage } from 'react-intl';
import { Layout, Form, Row, Button } from 'antd';

import { ReactRouterPropTypes } from '../../../../../validators/proptypes';
import { withMcsRouter } from '../../../../Helpers';
import { Actionbar } from '../../../../Actionbar';
import McsIcons from '../../../../../components/McsIcons.tsx';
import { FormInput, FormTitle, withValidators } from '../../../../../components/Form/index.ts';
import { PluginFieldGenerator } from '../../../../Plugin';
import CreativeFormatEditor from '../CreativeFormatEditor';

import messages from '../messages';

const { Content, Sider } = Layout;

const fieldGridConfig = {
  labelCol: { span: 3 },
  wrapperCol: { span: 10, offset: 1 },
};

class DisplayCreativeCreationEditor extends Component {

  handleSaveDisplayCreative = formValues => {
    const { save } = this.props;

    const formattedProperties = this.props.rendererProperties
      .filter(item => item.writable === true)
      .map(item => ({
        ...item,
        value: (formValues.properties[item.technical_name]
          ? formValues.properties[item.technical_name].value
          : item.value
        )
      }));

    save(formValues.creative, formattedProperties);
  }

  render() {
    const {
      match: { url },
      intl: { formatMessage },
      handleSubmit,
      submitting,
      fieldValidators: { formatIsNotZero, isRequired },
      breadcrumbPaths,
      changeType,
      adRenderer: {
        versionId
      },
      formats,
      organisationId
    } = this.props;

    const pluginFieldGenerated = this.props.rendererProperties.map(fieldDef => {
      return (
        <PluginFieldGenerator
          key={`${fieldDef.technical_name}`}
          definition={fieldDef}
          fieldGridConfig={fieldGridConfig}
          rendererVersionId={versionId}
          organisationId={organisationId}
        />
      );
    });

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
                items={['', 'general', 'properties']}
                currentClassName="currentStep"
              >
                <li>
                  <Link className="validated" to={`${url}`} onClick={() => changeType()}>
                    <McsIcons type="check-rounded-inverted" />
                    <span className="step-title">
                      <FormattedMessage {...messages.creativeSiderMenuCreativeType} />
                    </span>
                  </Link>
                </li>
                <li>
                  <Link to={`${url}#general`}>
                    <McsIcons type="check-rounded-inverted" />
                    <span className="step-title">
                      <FormattedMessage {...messages.creativeSiderMenuGeneralInformation} />
                    </span>
                  </Link>
                </li>
                <li>
                  <Link to={`${url}#properties`}>
                    <McsIcons type="check-rounded-inverted" />
                    <span className="step-title">
                      <FormattedMessage {...messages.creativeSiderMenuProperties} />
                    </span>
                  </Link>
                </li>
              </Scrollspy>
            </Sider>
            <Layout>
              <Content
                id={'displayCreativesSteps'}
                className="mcs-content-container mcs-form-container"
              >
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
                        },
                        helpToolTipProps: {
                          title: formatMessage(messages.creativeCreationGeneralNameFieldHelper),
                        },
                      }}
                    />

                    <Field
                      name="creative.format"
                      component={CreativeFormatEditor}
                      validate={[formatIsNotZero]}
                      formats={formats}
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
          </Layout>
        </Form>
      </Layout>
    );
  }
}

DisplayCreativeCreationEditor.defaultProps = {
  blasts: [],
  campaignName: '',
};

DisplayCreativeCreationEditor.propTypes = {
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
  changeType: PropTypes.func.isRequired,
  adRenderer: PropTypes.shape({
    id: PropTypes.number.isRequired,
    versionId: PropTypes.string.isRequired,
  }).isRequired,
  formats: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
  rendererProperties: PropTypes.arrayOf(PropTypes.shape().isRequired).isRequired,
  organisationId: PropTypes.string.isRequired,
};

DisplayCreativeCreationEditor = compose(
  injectIntl,
  withMcsRouter,
  reduxForm({
    form: 'creativeEditor'
  }),
  withValidators,
)(DisplayCreativeCreationEditor);

export default DisplayCreativeCreationEditor;
