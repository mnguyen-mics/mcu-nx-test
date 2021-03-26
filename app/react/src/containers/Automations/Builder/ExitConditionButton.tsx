import { McsIcon } from '@mediarithmics-private/mcs-components-library';
import { Popconfirm } from 'antd';
import * as React from 'react';
import {
  defineMessages,
  FormattedMessage,
  InjectedIntlProps,
  injectIntl,
} from 'react-intl';
import { compose } from 'recompose';
import {
  ScenarioExitConditionFormData,
  ScenarioExitConditionFormResource,
} from '../../../models/automations/automations';
import { InjectedFeaturesProps, injectFeatures } from '../../Features';
import { INITIAL_AUTOMATION_DATA } from '../Edit/domain';
import { StorylineNodeModel } from './domain';
import UsersCounter from './UsersCounter';
import injectDrawer, {
  InjectedDrawerProps,
} from '../../../components/Drawer/injectDrawer';
import ScenarioExitConditionAutomationForm from './ScenarioExitConditionAutomationForm';
import ExitConditionAutomationDashboardStats, {
  ExitConditionAutomationDashboardStatsProps,
} from './AutomationNode/Dashboard/ExitCondition/ExitConditionDashboardStats';

const messages = defineMessages({
  eventGlobalExitCondition: {
    id: 'automation.builder.exitCondition.event',
    defaultMessage: 'Exit on Event',
  },
  addGlobalExitCondition: {
    id: 'automation.builder.exitCondition.new',
    defaultMessage: 'Add Exit condition',
  },
  noGlobalExitCondition: {
    id: 'automation.builder.exitCondition.empty',
    defaultMessage: 'No exit condition',
  },
  deleteGlobalExitConditionTitle: {
    id: 'automation.builder.exitCondition.delete.info',
    defaultMessage: 'Are you sure you want to delete the exit condition ?',
  },
  deleteGlobalExitConditionConfirm: {
    id: 'automation.builder.exitCondition.delete.confirm',
    defaultMessage: 'Yes',
  },
  deleteGlobalExitConditionCancel: {
    id: 'automation.builder.exitCondition.delete.cancel',
    defaultMessage: 'No',
  },
  exitConditionStats: {
    id: 'automation.builder.exitCondition.stats',
    defaultMessage: 'View Stats.',
  },
  exitConditionconfig: {
    id: 'automation.builder.exitCondition.Config',
    defaultMessage: 'View Config.',
  },
});

interface ExitConditionButtonProps {
  datamartId: string;
  automationTreeData?: StorylineNodeModel;
  exitCondition?: ScenarioExitConditionFormResource;
  viewer: boolean;
  updateAutomationData?: (
    automationData: StorylineNodeModel,
    exitConditionFormResource?: ScenarioExitConditionFormResource,
  ) => StorylineNodeModel;
}

type Props = ExitConditionButtonProps &
  InjectedDrawerProps &
  InjectedIntlProps &
  InjectedFeaturesProps;

interface State {
  viewSubmenus: boolean;
}

class ExitConditionButton extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      viewSubmenus: false,
    };
  }

  updateExitCondition = (
    exitConditionFormData: ScenarioExitConditionFormData,
  ): void => {
    const {
      automationTreeData,
      exitCondition,
      viewer,
      updateAutomationData,
    } = this.props;
    if (
      !viewer &&
      automationTreeData &&
      exitCondition &&
      updateAutomationData
    ) {
      updateAutomationData(automationTreeData, {
        ...exitCondition,
        formData: exitConditionFormData,
      });
    }
  };

  onGlobalExitConditionDelete = () => {
    this.updateExitCondition(
      INITIAL_AUTOMATION_DATA.exitCondition.initialFormData,
    );
  };

  onGlobalExitConditionSelectConfig = () => {
    const {
      openNextDrawer,
      closeNextDrawer,
      exitCondition,
      datamartId,
      viewer,
    } = this.props;
    const { viewSubmenus } = this.state;
    if (exitCondition) {
      this.setState({ viewSubmenus: !viewSubmenus }, () => {
        openNextDrawer<{}>(ScenarioExitConditionAutomationForm, {
          additionalProps: {
            exitCondition: exitCondition,
            disabled: viewer,
            initialValues: {
              ...exitCondition.formData,
              datamart_id: datamartId,
              events: [],
            },
            close: () => {
              closeNextDrawer();
            },
            onSubmit: (formData: ScenarioExitConditionFormData) => {
              this.updateExitCondition(formData);
              closeNextDrawer();
            },
          },
          size: 'small',
        });
      });
    }
  };

  onGlobalExitConditionSelectStats = () => {
    const { openNextDrawer, closeNextDrawer, exitCondition } = this.props;
    const { viewSubmenus } = this.state;
    if (exitCondition) {
      this.setState({ viewSubmenus: !viewSubmenus }, () => {
        openNextDrawer<ExitConditionAutomationDashboardStatsProps>(
          ExitConditionAutomationDashboardStats,
          {
            additionalProps: {
              exitConditionId: exitCondition.id,
              close: closeNextDrawer,
            },
            size: 'small',
          },
        );
      });
    }
  };

  buildExitConditionMenu = () => {
    const { hasFeature } = this.props;
    return (
      <div className="mcs-exitConditionAutomation_menu">
        {hasFeature('automations-analytics') ? (
          <div
            key="stats"
            onClick={this.onGlobalExitConditionSelectStats}
            className="mcs-exitConditionAutomation_menuItem"
          >
            <FormattedMessage {...messages.exitConditionStats} />
          </div>
        ) : null}
        <div
          key="stats"
          onClick={this.onGlobalExitConditionSelectConfig}
          className="mcs-exitConditionAutomation_menuItem"
        >
          <FormattedMessage {...messages.exitConditionconfig} />
        </div>
      </div>
    );
  };

  triggerExitConditionMenu = () => {
    const { viewSubmenus } = this.state;
    this.setState({ viewSubmenus: !viewSubmenus });
  };

  getExitConditionBaseButton = () => {
    const { exitCondition, viewer } = this.props;
    const onClickAndMessage =
      exitCondition && exitCondition.formData.query_text
        ? viewer
          ? {
              onClick: this.triggerExitConditionMenu,
              message: messages.eventGlobalExitCondition,
            }
          : {
              onClick: this.onGlobalExitConditionSelectConfig,
              message: messages.eventGlobalExitCondition,
            }
        : viewer
        ? { onClick: undefined, message: messages.noGlobalExitCondition }
        : {
            onClick: this.onGlobalExitConditionSelectConfig,
            message: messages.addGlobalExitCondition,
          };
    return (
      <div className={'edit'} onClick={onClickAndMessage.onClick}>
        <FormattedMessage {...onClickAndMessage.message} />
      </div>
    );
  };

  render() {
    const {
      exitCondition,
      viewer,
      hasFeature,
      intl: { formatMessage },
    } = this.props;
    const { viewSubmenus } = this.state;

    const exitConditionBaseButton = this.getExitConditionBaseButton();

    const subMenu = viewSubmenus ? this.buildExitConditionMenu() : null;

    const usersCounter =
      hasFeature('automations-analytics') &&
      exitCondition &&
      exitCondition.formData.query_text &&
      viewer ? (
        <UsersCounter iconName={'user'} numberOfUsers={123456789} />
      ) : null;

    return (
      hasFeature('automations-global-exit-condition') && (
        <div className="button-helpers bottom exit-condition-container">
          {subMenu}

          <div className="exit-condition">
            <div className="helper exit-condition-buttons">
              {exitConditionBaseButton}
              {!viewer && exitCondition && exitCondition.formData.query_text && (
                <Popconfirm
                  title={formatMessage(messages.deleteGlobalExitConditionTitle)}
                  onConfirm={this.onGlobalExitConditionDelete}
                  placement={'topRight'}
                  okText={formatMessage(
                    messages.deleteGlobalExitConditionConfirm,
                  )}
                  cancelText={formatMessage(
                    messages.deleteGlobalExitConditionCancel,
                  )}
                >
                  <div className={'delete'}>
                    <McsIcon type={'close'} />
                  </div>
                </Popconfirm>
              )}
            </div>

            {usersCounter}
          </div>
        </div>
      )
    );
  }
}
export default compose<Props, ExitConditionButtonProps>(
  injectDrawer,
  injectIntl,
  injectFeatures,
)(ExitConditionButton);
