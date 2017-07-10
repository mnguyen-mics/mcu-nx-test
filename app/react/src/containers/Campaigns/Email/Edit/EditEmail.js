/* eslint-disable */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Layout, Icon, Form, Row, Col, Button } from 'antd';
import { Link, withRouter } from 'react-router-dom';
import Scrollspy from 'react-scrollspy';
import { Field, reduxForm } from 'redux-form'
import { compose } from 'recompose';
import { injectIntl, intlShape, FormattedMessage } from 'react-intl';

import { Actionbar } from '../../../Actionbar';
import { McsIcons } from '../../../../components/McsIcons';
import Drawer from '../../../../components/Drawer';
import { 
  FormInput,
  FormTitle,
  FormSelect
} from '../../../../components/Form';
import CampaignEmailTable from '../../Email/Dashboard/CampaignEmailTable';
import messages from './messages';

const { Content, Sider } = Layout;

const required = value => (value ? undefined : 'Required')

class EditEmail extends Component {

  handleSubmit(values) {
    console.log('form submit');
    window.alert(`Save Campaign !`);
  }

  render() {

    const {
      match: { 
        url,
        params: { organisationId }
      },
      intl: { formatMessage }
    } = this.props;

    const fieldGridConfig = {
      labelCol: { span: 3 },
      wrapperCol: { span: 10, offset: 1 }
    }

    const breadcrumbPaths = [
      { name: formatMessage(messages.emailCampaignBreadcrumName), url: `/v2/o/${organisationId}/campaigns/email` },
      { name: formatMessage(messages.newEmailCampaignBreadcrumName) }
    ];

    return (
      <Layout>
        <Form className="edit-email-form" onSubmit={this.handleSubmit}>
          <Actionbar path={breadcrumbPaths}>
            <Button type="primary" htmlType="submit">
              <McsIcons type="plus" /> <FormattedMessage {...messages.saveCampaign} />
            </Button>              
            <Link to={`/v2/o/${organisationId}/campaigns/email`}><McsIcons type="close" className="close-icon"/></Link>
          </Actionbar>
        <Layout>
          <Sider className="stepper">
            <Scrollspy rootEl="#emailCampaignSteps" items={['general', 'router', 'blasts']} currentClassName="currentStep" focusedFormSection={'router'}>
              <li><Link to={`${url}#general`} ><Icon type="check-circle-o" /><span className="step-title">General Information</span></Link></li>
              <li><Link to={`${url}#router`} ><Icon type="check-circle-o" /><span className="step-title">Router Config</span></Link></li>
              <li><Link to={`${url}#blasts`} ><Icon type="check-circle-o" /><span className="step-title">Email Blasts</span></Link></li>
            </Scrollspy>
          </Sider>
          <Content id={'emailCampaignSteps'} className="mcs-content-container mcs-edit-email-container" ref={content => this.content = content}>            
              <div id={`general`}>
                  <FormTitle titleMessage={messages.generalInformationTitle} subTitleMessage={messages.generalInformationSubTitle}/>
                  <Field
                    name="name"
                    component={FormInput}
                    validate={[required]}
                    props={{
                      formItemProps: {
                        label: formatMessage(messages.nameInputLabel),
                        required: true,
                        ...fieldGridConfig
                      },
                      inputProps: {
                        placeholder: formatMessage(messages.nameInputPlaceholder)
                      },
                      helpToolTipProps: {
                        title: 'Campaign name'
                      }
                    }}
                    />
                  <Field
                    name="technicalName"
                    component={FormInput}
                    validate={[required]}
                    props={{
                      formItemProps: {
                        label: formatMessage(messages.technicalNameInputLabel),
                        required: true,
                        ...fieldGridConfig
                      },
                      inputProps: {
                        placeholder: formatMessage(messages.technicalNameInputPlaceholder)
                      },
                      helpToolTipProps: {
                        title: 'Campaign technical name'
                      }
                    }}
                  />                
              </div>
              <div id={`router`}>
                <FormTitle titleMessage={messages.routerTitle} subTitleMessage={messages.routerSubTitle}/>
                <Field
                  name="routerId"
                  component={FormSelect}
                  validate={[required]}
                  props={{
                    formItemProps: {
                      label: formatMessage(messages.routerSelectLabel),
                      required: true,
                      ...fieldGridConfig
                    },
                    options: [
                      { key: 'router_1', value: 'router_1', text: 'router 1' },
                      { key: 'router_2', value: 'router_2', text: 'router 2' }
                    ],
                    helpToolTipProps: {
                      title: 'Choose your route'
                    }
                  }}
                />
                <Field
                  name="providerId"
                  component={FormSelect}
                  validate={[required]}
                  props={{
                    formItemProps: {
                      label: formatMessage(messages.providerSelectLabel),
                      required: true,
                      ...fieldGridConfig
                    },
                    options: [
                      { key: 'proviver_1', value: 'proviver_1', text: 'proviver 1' },
                      { key: 'proviver_2', value: 'proviver_2', text: 'provider 2' }
                    ],
                    helpToolTipProps: {
                      title: 'Choose your provider'
                    }
                  }}
                />
              </div>
              <div id={`blasts`}>
                <FormTitle titleMessage={messages.emailBlastTitle} subTitleMessage={messages.emailBlastSubTitle}/>
                <Row>
                  <Col span={18} style={{ backgroundColor: 'white' }}>
                    <Col span={24} style={{ padding: '20px'}}>
                      <Row type="flex" justify="space-between" align="middle">
                        <span>Router</span>
                        <Button type="primary">New Blast</Button>
                      </Row>
                    </Col>
                    <Col span={24} style={{ paddingLeft: '20px', paddingRight: '20px' }}>
                      <CampaignEmailTable />
                    </Col>
                  </Col>
                </Row>
              </div>
          </Content>
        </Layout>
        </Form>
      </Layout>
    );
  }
}

EditEmail.propTypes = {
  match: PropTypes.shape({
    url: PropTypes.string.isRequired
  }).isRequired,
  intl: intlShape.isRequired
};

EditEmail = compose(
  reduxForm({ 
    form: 'campaignEmailEdit' 
  }),
  injectIntl,
  withRouter
)(EditEmail)


export default EditEmail;
