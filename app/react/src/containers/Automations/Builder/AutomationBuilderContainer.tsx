import * as React from 'react';
import { compose } from 'recompose';
import { Layout } from 'antd';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { connect } from 'react-redux';
import * as SessionHelper from '../../../state/Session/selectors';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../Notifications/injectNotifications';
import { RouteComponentProps, withRouter } from 'react-router';
import AutomationBuilder from './AutomationBuilder';

export interface AutomationBuilderContainerProps {
  datamartId: string;
  renderActionBar: (
    datamartId: string,
  ) => React.ReactNode;
}

type Props = AutomationBuilderContainerProps &
InjectedIntlProps &
InjectedNotificationProps &
RouteComponentProps<{ organisationId: string }>;

class AutomationBuilderContainer extends React.Component<Props> {
  
  render() {
    const {
      match: {
        params: { organisationId },
      },
    } = this.props;
    
    return (
      <Layout>
      <Layout.Content
      className={`mcs-content-container`}
      style={{ padding: 0, overflow: 'hidden' }}
      >
      <AutomationBuilder
      datamartId={this.props.datamartId}
      organisationId={organisationId}
      />
      </Layout.Content>
      </Layout>
    );
  }
}

export default compose<Props, AutomationBuilderContainerProps>(
  withRouter,
  injectIntl,
  injectNotifications,
  connect(state => ({
    getWorkspace: SessionHelper.getWorkspace,
  })),
)(AutomationBuilderContainer);
