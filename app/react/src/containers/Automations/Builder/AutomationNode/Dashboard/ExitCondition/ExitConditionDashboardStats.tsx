import * as React from 'react';
import { defineMessages, InjectedIntlProps, injectIntl } from 'react-intl';
import { compose } from 'recompose';
import UserPointsLineChart from '../NodeCharts/UserPointsLineChart';
import ScenarioAnalyticsGenericDashboard from '../ScenarioAnalyticsGenericDashboard/ScenarioAnalyticsGenericDashboard';

const messages = defineMessages({
  actionbarName: {
    id: 'automation.exitCondition.dashboard.stats.actionbar.name',
    defaultMessage: 'Exit condition stats',
  },
  upGraphTitle: {
    id: 'automation.exitCondition.dashboard.stats.graphs.upLineGraph.title',
    defaultMessage:
      'Number of users leaving the scenario because of the exit condition',
  },
});

export interface ExitConditionAutomationDashboardStatsProps {
  datamartId: string;
  exitConditionId: string;
  close: () => void;
}

type Props = ExitConditionAutomationDashboardStatsProps & InjectedIntlProps;

class ExitConditionAutomationDashboardStats extends React.Component<Props> {
  render() {
    const {
      intl: { formatMessage },
      exitConditionId,
      datamartId,
      close,
    } = this.props;

    return (
      <ScenarioAnalyticsGenericDashboard
        dashboardTitle={formatMessage(messages.actionbarName)}
        close={close}
      >
        <UserPointsLineChart
          graphTitle={formatMessage(messages.upGraphTitle)}
          datamartId={datamartId}
          analyticsEntity={{
            analyticsEntityType: 'EXIT_CONDITION',
            entityId: exitConditionId,
          }}
        />
      </ScenarioAnalyticsGenericDashboard>
    );
  }
}

export default compose<Props, ExitConditionAutomationDashboardStatsProps>(
  injectIntl,
)(ExitConditionAutomationDashboardStats);
