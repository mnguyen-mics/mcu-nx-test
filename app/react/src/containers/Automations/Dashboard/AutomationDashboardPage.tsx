import * as React from 'react';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router';
import { compose } from 'recompose';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../Notifications/injectNotifications';
import { lazyInject } from '../../../config/inversify.config';
import { TYPES } from '../../../constants/types';
import { AutomationFormData, INITIAL_AUTOMATION_DATA } from '../Edit/domain';

import { IAutomationFormService } from '../Edit/AutomationFormService';
import { Loading } from '../../../components';
import { Layout } from 'antd';
import AutomationBuilder from '../Builder/AutomationBuilder';

export interface AutomationDashboardrams {
  organisationId: string;
  automationId: string;
}

interface State {
  isLoading: boolean;
  automationFormData: Partial<AutomationFormData>;
}

type Props = RouteComponentProps<AutomationDashboardrams> &
  InjectedNotificationProps &
  InjectedIntlProps;


class AutomationDashboardPage extends React.Component<Props, State> {
  @lazyInject(TYPES.IAutomationFormService)
  private _automationFormService: IAutomationFormService;
  constructor(props: Props) {
    super(props);
    this.state = {
      isLoading: true,
      automationFormData: INITIAL_AUTOMATION_DATA,
    };
  }

  componentDidMount() {
    const {
      match: {
        params: { automationId },
      },
    } = this.props;
    if (automationId) {
      this.setState({
        isLoading: true,
      });
      this._automationFormService
        .loadInitialAutomationValues(automationId, 'v201709')
        .then(res => {
          this.setState({
            automationFormData: res,
            isLoading: false,
          });
        });
    }
  }

  componentDidUpdate(prevProps: Props) {
    const {
      match: {
        params: { automationId },
      },
    } = this.props;
    const {
      match: {
        params: { automationId: prevAutomationId },
      },
    } = prevProps;
    if (!automationId && automationId !== prevAutomationId) {
      this.setState({
        automationFormData: INITIAL_AUTOMATION_DATA,
      });
    } else if (automationId !== prevAutomationId) {
      this.setState({
        isLoading: true,
      });
      this._automationFormService
        .loadInitialAutomationValues(automationId, 'v201709')
        .then(res => {
          this.setState({
            automationFormData: res,
            isLoading: false,
          });
        });
    }
  }

  render() {

    const { automationFormData, isLoading } = this.state;

    if (isLoading) {
      return <Loading className="loading-full-screen" />;
    }

    if (!automationFormData.automation || !automationFormData.automationTreeData) {
      return ('this automation does not seem to exist!')
    }

    return (
      <div style={{ height: '100%', display: 'flex' }}>
        <Layout>
          {/* <AutomationActionBar
            automationData={{
              automation:
                automationFormData && automationFormData.automation
                  ? {
                      ...automationFormData.automation,
                      datamart_id: datamartId,
                    }
                  : undefined,
              automationTreeData: automationTreeData,
            }}
            saveOrUpdate={saveOrUpdate}
            onClose={this.handleEditMode}
            editMode={editMode}
            handleEditMode={this.handleEditMode}
          /> */}
          <Layout.Content
            className={`mcs-content-container`}
            style={{ padding: 0, overflow: 'hidden' }}
          >
            <AutomationBuilder
              datamartId={automationFormData.automation.datamart_id!}
              automationTreeData={automationFormData.automationTreeData}
              scenarioId={automationFormData.automation.id!}
              viewer={true}
            />
          </Layout.Content>
        </Layout>
      </div>
    );
  }
}

export default compose(
  injectIntl,
  withRouter,
  injectNotifications,
  connect((state: any) => ({
    connectedUser: state.session.connectedUser,
  })),
)(AutomationDashboardPage);
