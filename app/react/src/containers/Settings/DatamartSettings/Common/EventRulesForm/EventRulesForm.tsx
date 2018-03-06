import * as React from 'react';
import {
  Form,
  reduxForm,
  InjectedFormProps,
  ConfigProps,
} from 'redux-form';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { Layout } from 'antd';
import { withRouter, RouteComponentProps } from 'react-router';
import { BasicProps } from 'antd/lib/layout/layout';
import { injectIntl, InjectedIntlProps, defineMessages } from 'react-intl';
import { Path } from '../../../../../components/ActionBar';
import FormLayoutActionbar, {
  FormLayoutActionbarProps,
} from '../../../../../components/Layout/FormLayoutActionbar';

import { EventRulesFormData } from '../domain';
import { Omit } from '../../../../../utils/Types';
import CatalogAutoMatch from './Sections/CatalogAutoMatch';
import UserIdentifierinsertion from './Sections/UserIdentifierinsertion'; 
import UriMatch from './Sections/UriMatch';
import PropertyToOriginCopy from './Sections/PropertyToOriginCopy';
import * as SessionSelectors from '../../../../../state/Session/selectors';

const messages = defineMessages({
  saveEventRules: {
    id: 'settings.form.eventRules.save',
    defaultMessage: 'Save',
  },
  error: {
    id: 'settings.form.eventRules.errorType',
    defaultMessage: 'Please specify a known type'
  }
})

const Content = Layout.Content as React.ComponentClass<
  BasicProps & { id: string }
>;


export interface EventRulesFormProps
  extends Omit<ConfigProps<EventRulesFormData>, 'form'> {
  close: () => void;
  breadCrumbPaths: Path[];
}

interface MapStateToProps {
  hasDatamarts: (organisationId: string) => boolean;
}

type Props = InjectedFormProps<
  EventRulesFormData,
  EventRulesFormProps
> &
  EventRulesFormProps &
  MapStateToProps &
  InjectedIntlProps &
  RouteComponentProps<{ organisationId: string }>;

const FORM_ID = 'eventRulesForm';

class EventRulesForm extends React.Component<Props> {
  render() {
    const {
      handleSubmit,
      breadCrumbPaths,
      close,
      initialValues,
      intl,
    } = this.props;


    const actionBarProps: FormLayoutActionbarProps = {
      formId: FORM_ID,
      paths: breadCrumbPaths,
      message: messages.saveEventRules,
      onClose: close,
    };


    const renderConditionnaly = () => {
      if (initialValues.model) {
        switch (initialValues.model.type) {
          case 'CATALOG_AUTO_MATCH':
            return <CatalogAutoMatch />
          case 'PROPERTY_TO_ORIGIN_COPY':
            return <PropertyToOriginCopy />
          case 'URL_MATCH':
            return <UriMatch />
          case 'USER_IDENTIFIER_INSERTION':
            return <UserIdentifierinsertion />
        }
      }
      return <div>{intl.formatMessage(messages.error)}</div>
      
    }

    return (
      <Layout className="edit-layout">
        <FormLayoutActionbar {...actionBarProps} />
        <Layout className={'ant-layout-has-sider'}>
          <Form
            className="edit-layout ant-layout"
            onSubmit={handleSubmit as any}
          >
            <Content
              id={FORM_ID}
              className="mcs-content-container mcs-form-container"
            >
              { renderConditionnaly() }
            </Content>
          </Form>
        </Layout>
      </Layout>
    );
  }
}

export default compose<Props, EventRulesFormProps>(
  injectIntl,
  withRouter,
  reduxForm({
    form: FORM_ID,
    enableReinitialize: true,
  }),
  connect(state => ({ hasDatamarts: SessionSelectors.hasDatamarts(state) })),
)(EventRulesForm);
