import * as React from 'react';
import { compose } from 'recompose';
import { /*message,*/ Layout } from 'antd';
import { connect } from 'react-redux';
import * as SessionHelper from '../../../state/Session/selectors';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../Notifications/injectNotifications';
import AutomationBuilder from './AutomationBuilder';
import { StorylineNodeModel, storylineNodeData } from './domain';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import AutomationActionBar from './ActionBar/AutomationActionBar';
import { AutomationFormData, INITIAL_AUTOMATION_DATA } from '../Edit/domain';
import { withRouter, RouteComponentProps } from 'react-router';
import { AutomationBuilderPageRouteParams } from './AutomationBuilderPage';
import { Loading } from '../../../components';
import { QueryInputUiCreationMode } from '../../../models/automations/automations';
import { injectFeatures, InjectedFeaturesProps } from '../../Features';

export interface AutomationBuilderContainerProps {
  datamartId: string;
  automationFormData?: Partial<AutomationFormData>;
  saveOrUpdate: (formData: Partial<AutomationFormData>) => void;
  loading: boolean;
  creation_mode: QueryInputUiCreationMode;
  edition?: boolean;
}

type Props = AutomationBuilderContainerProps &
  InjectedNotificationProps &
  RouteComponentProps<AutomationBuilderPageRouteParams> &
  InjectedIntlProps &
  InjectedFeaturesProps;

interface State {
  automationTreeData: StorylineNodeModel;
}

class AutomationBuilderContainer extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      automationTreeData:
        props.automationFormData && props.automationFormData.automationTreeData
          ? props.automationFormData.automationTreeData
          : INITIAL_AUTOMATION_DATA.automationTreeData,
    };
  }

  componentDidUpdate(prevProps: Props) {
    const { automationFormData } = this.props;
    const { automationFormData: prevAutomationFormData } = prevProps;
    if (
      automationFormData &&
      prevAutomationFormData &&
      automationFormData.automationTreeData &&
      prevAutomationFormData.automationTreeData &&
      automationFormData.automationTreeData.node &&
      prevAutomationFormData.automationTreeData.node &&
      prevAutomationFormData.automationTreeData.node.id !==
        automationFormData.automationTreeData.node.id
    ) {
      this.setState({
        automationTreeData: automationFormData.automationTreeData,
      });
    }
  }

  handleUpdateAutomationData = (
    newAutomationData: StorylineNodeModel,
  ): StorylineNodeModel => {

    this.setState({
      automationTreeData: newAutomationData,
    });
    return newAutomationData;
  };


  render() {
    const {
      datamartId,
      automationFormData,
      saveOrUpdate,
      loading,
      creation_mode,
      hasFeature,
      intl
    } = this.props;
    const { automationTreeData } = this.state;

    if (loading) {
      return <Loading className="loading-full-screen" />;
    }

    return (
      <div style={{ height: '100%', display: 'flex' }}>
        <Layout>
          <AutomationActionBar
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
          />
          <Layout.Content
            className={`mcs-content-container`}
            style={{ padding: 0, overflow: 'hidden' }}
          >
            <AutomationBuilder
              datamartId={datamartId}
              automationTreeData={automationTreeData}
              scenarioId={storylineNodeData[0].scenario_id}
              updateAutomationData={this.handleUpdateAutomationData}
              viewer={false}
              creation_mode={creation_mode}
              hasFeature={hasFeature}
              intl={intl}
            />
          </Layout.Content>
        </Layout>
      </div>
    );
  }
}

export default compose<Props, AutomationBuilderContainerProps>(
  injectIntl,
  injectNotifications,
  injectFeatures,
  withRouter,
  connect(state => ({
    getWorkspace: SessionHelper.getWorkspace,
  })),
)(AutomationBuilderContainer);
