import * as React from 'react';
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
import { Layout, Button } from 'antd';
import AutomationBuilder from '../Builder/AutomationBuilder';
import { IScenarioService } from '../../../services/ScenarioService';
import { AutomationStatus } from '../../../models/automations/automations';
import {
  Actionbar,
  McsDateRangePicker,
  McsIcon,
} from '@mediarithmics-private/mcs-components-library';
import { Path } from '@mediarithmics-private/mcs-components-library/lib/components/action-bar/Actionbar';
import { InjectedIntlProps, injectIntl, defineMessages } from 'react-intl';
import injectDrawer, {
  InjectedDrawerProps,
} from '../../../components/Drawer/injectDrawer';
import AutomationScenarioTest, {
  AutomationScenarioTestProps,
} from './Test/AutomationScenarioTest';
import { InjectedFeaturesProps, injectFeatures } from '../../Features';
import { McsDateRangeValue } from '@mediarithmics-private/mcs-components-library/lib/components/mcs-date-range-picker/McsDateRangePicker';
import { DateSearchSettings, DATE_SEARCH_SETTINGS, parseSearch, updateSearch } from '../../../utils/LocationSearchHelper';
import McsMoment from '../../../utils/McsMoment';

export interface AutomationDashboardrams {
  organisationId: string;
  automationId: string;
}

interface State {
  isLoading: boolean;
  updating: boolean;
  automationFormData: Partial<AutomationFormData>;
}

type Props = InjectedNotificationProps &
  InjectedDrawerProps &
  InjectedIntlProps &
  InjectedFeaturesProps &
  RouteComponentProps<AutomationDashboardrams>;

const messages = defineMessages({
  testTitle: {
    id: 'automationDashboardPage.actionBar.test',
    defaultMessage: 'Test',
  },
  timeWindowLabel: {
    id: 'automationDashboardPage.actionBar.timeWindow.label',
    defaultMessage: 'View user flow',
  },
});

class AutomationDashboardPage extends React.Component<Props, State> {
  @lazyInject(TYPES.IAutomationFormService)
  private _automationFormService: IAutomationFormService;

  @lazyInject(TYPES.IScenarioService)
  private _scenarioService: IScenarioService;

  constructor(props: Props) {
    super(props);
    this.state = {
      isLoading: true,
      updating: false,
      automationFormData: INITIAL_AUTOMATION_DATA,
    };
  }

  componentDidMount() {
    const {
      match: {
        params: { automationId },
      },
      history: {
        location: { search },
      },
    } = this.props;
    if (automationId) {
      this.setState({
        isLoading: true,
      });
      this._automationFormService
        .loadInitialAutomationValues(automationId)
        .then(res => {
          this.setState({
            automationFormData: res,
            isLoading: false,
          });
        });
    }
    const filter = parseSearch(search, DATE_SEARCH_SETTINGS);
    if (!filter.from.value || !filter.from.to) {
      this.updateLocationSearch({
        from: new McsMoment("now-7d"),
        to: new McsMoment("now"),
      })
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
        .loadInitialAutomationValues(automationId)
        .then(res => {
          this.setState({
            automationFormData: res,
            isLoading: false,
          });
        });
    }
  }

  renderStatus = (status: AutomationStatus) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span>
            <McsIcon type="pause" /> Pause
          </span>
        );
      case 'NEW':
      case 'PAUSED':
        return (
          <span>
            <McsIcon type="play" /> Activate
          </span>
        );
    }
  };

  onStatusClick = (automationId: string, status: AutomationStatus) => () => {
    const newStatus: AutomationStatus =
      status === 'PAUSED' || status === 'NEW' ? 'ACTIVE' : 'PAUSED';
    const payload = {
      status: newStatus,
      id: automationId,
    };

    this.setState({ updating: true });
    return this._scenarioService.updateScenario(automationId, payload).then(r =>
      this.setState({
        automationFormData: {
          ...this.state.automationFormData,
          automation: r.data,
        },
        updating: false,
      }),
    );
  };

  onEditClick = () => {
    const {
      history,
      match: {
        params: { organisationId, automationId },
      },
    } = this.props;
    history.push(`/v2/o/${organisationId}/automations/${automationId}/edit`);
  };

  onTestClick = (datamartId: string, nodeId: string) => () => {
    const { openNextDrawer, closeNextDrawer } = this.props;
    const size: 'small' | 'large' = 'small';

    const props = {
      close: closeNextDrawer,
      datamartId: datamartId,
      nodeId: nodeId,
    };

    openNextDrawer<AutomationScenarioTestProps>(AutomationScenarioTest, {
      additionalProps: props,
      size: size,
    });
  };

  renderDatePicker = () => {
    const {
      history: {
        location: { search },
      },
    } = this.props;

    const filter = parseSearch(search, DATE_SEARCH_SETTINGS);

    const values = {
      from: filter.from,
      to: filter.to,
    };

    const onChange = (newValues: McsDateRangeValue) =>
      this.updateLocationSearch({
        from: newValues.from,
        to: newValues.to,
      });

    return <McsDateRangePicker values={values} onChange={onChange} />;
  };

  updateLocationSearch = (params: DateSearchSettings) => {
    const {
      history,
      location: { search: currentSearch, pathname },
    } = this.props;

    const nextLocation = {
      pathname,
      search: updateSearch(currentSearch, params, DATE_SEARCH_SETTINGS),
    };

    history.push(nextLocation);
  };

  render() {
    const {
      match: {
        params: { organisationId },
      },
      intl: { formatMessage },
      hasFeature,
    } = this.props;
    const { automationFormData, isLoading, updating } = this.state;

    if (isLoading) {
      return <Loading isFullScreen={true} />;
    }

    if (
      !automationFormData.automation ||
      !automationFormData.automationTreeData
    ) {
      return 'this automation does not seem to exist!';
    }

    const breadCrumbPaths: Path[] = [
      {
        name: 'Automations',
        path: `/v2/o/${organisationId}/automations`,
      },
      {
        name: automationFormData.automation.name
          ? automationFormData.automation.name
          : '',
      },
    ];

    const automationStatus = automationFormData.automation.status;

    const datamartId = automationFormData.automation?.datamart_id;
    const nodeId = automationFormData.automationTreeData?.node.id;

    const testButton =
      (automationStatus === 'ACTIVE' || automationStatus === 'PAUSED') &&
        datamartId &&
        nodeId &&
        hasFeature('automations-test-scenario') ? (
          <Button
            onClick={this.onTestClick(datamartId, nodeId)}
            disabled={isLoading}
          >
            <McsIcon type={'gears'} />
            {formatMessage(messages.testTitle)}
          </Button>
        ) : null;

    const displayDateRange = hasFeature("automations-analytics");

    return (
      <Layout className="mcs-automationDashboardPage">
        <Actionbar paths={breadCrumbPaths}>
          {automationFormData.automation &&
            automationFormData.automation.status &&
            automationFormData.automation.id ? (
              <Button
                onClick={this.onStatusClick(
                  automationFormData.automation.id,
                  automationFormData.automation.status,
                )}
                className={'mcs-primary'}
                type="primary"
              >
                {updating ? (
                  <i
                    className="mcs-table-cell-loading"
                    style={{ minWidth: 50 }}
                  />
                ) : (
                    this.renderStatus(automationFormData.automation.status)
                  )}
              </Button>
            ) : null}
          <Button onClick={this.onEditClick}>
            <McsIcon type={'pen'} /> Edit
            </Button>
          {testButton}
          {displayDateRange && <span
            className='mcs-automationDashboardPage_actionBar_dateRange_label'
            key="label">{formatMessage(messages.timeWindowLabel)}
          </span>}
          {displayDateRange && this.renderDatePicker()}
        </Actionbar>

        <Layout.Content
          className={`mcs-content-container`}
          style={{ padding: 0, overflow: 'hidden' }}
        >
          <AutomationBuilder
            datamartId={automationFormData.automation.datamart_id!}
            automationTreeData={automationFormData.automationTreeData}
            exitCondition={automationFormData.exitCondition}
            scenarioId={automationFormData.automation.id!}
            viewer={true}
          />
        </Layout.Content>
      </Layout>
    );
  }
}

export default compose(
  withRouter,
  injectIntl,
  injectDrawer,
  injectNotifications,
  injectFeatures,
)(AutomationDashboardPage);
