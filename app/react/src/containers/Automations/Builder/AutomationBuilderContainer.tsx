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
import { QueryInputUiCreationMode, ScenarioExitConditionFormResource } from '../../../models/automations/automations';
import { injectFeatures, InjectedFeaturesProps } from '../../Features';
import { injectDrawer } from '../../../components/Drawer';
import { InjectedDrawerProps } from '../../../components/Drawer/injectDrawer';

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
  InjectedDrawerProps &
  InjectedFeaturesProps;

interface State {
  automationTreeData: StorylineNodeModel;
  exitConditionFormResource: ScenarioExitConditionFormResource;
}

class AutomationBuilderContainer extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      automationTreeData:
        props.automationFormData && props.automationFormData.automationTreeData
          ? props.automationFormData.automationTreeData
					: INITIAL_AUTOMATION_DATA.automationTreeData,
			exitConditionFormResource:
				props.automationFormData && props.automationFormData.exitCondition ?
				props.automationFormData.exitCondition :
				INITIAL_AUTOMATION_DATA.exitCondition
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
		exitConditionData?: ScenarioExitConditionFormResource,
  ): StorylineNodeModel => {
		if(exitConditionData) {
			this.setState({
				automationTreeData: newAutomationData,
				exitConditionFormResource: exitConditionData,
			});
		} else {
			this.setState({
				automationTreeData: newAutomationData,
			});
		}
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
      intl,
      openNextDrawer,
      closeNextDrawer,
    } = this.props;
    const { automationTreeData, exitConditionFormResource } = this.state;

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
							exitCondition: exitConditionFormResource,
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
              exitCondition={exitConditionFormResource}
              scenarioId={storylineNodeData[0].scenario_id}
              updateAutomationData={this.handleUpdateAutomationData}
              viewer={false}
              creation_mode={creation_mode}
              hasFeature={hasFeature}
              intl={intl}
              openNextDrawer={openNextDrawer}
              closeNextDrawer={closeNextDrawer}
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
  injectDrawer,
  connect(state => ({
    getWorkspace: SessionHelper.getWorkspace,
  })),
)(AutomationBuilderContainer);
