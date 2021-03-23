import * as React from 'react';
import { defineMessages, InjectedIntlProps, injectIntl } from 'react-intl';
import { compose } from 'recompose';
import UserPointsLineChart from '../NodeCharts/UserPointsLineChart';
import ScenarioAnalyticsGenericDashboard from '../ScenarioAnalyticsGenericDashboard/ScenarioAnalyticsGenericDashboard';

const messages = defineMessages({
  actionbarName: {
    id: 'automation.exitNode.dashboard.stats.actionbar.name',
    defaultMessage: 'Exit node stats',
  },
  upGraphTitle: {
    id: 'automation.exitNode.dashboard.stats.graphs.upLineGraph.title',
    defaultMessage: 'Number of users exiting the scenario',
  },
});

export interface ExitNodeAutomationDashboardStatsProps {
  nodeId: string;
  close: () => void;
}

type Props = ExitNodeAutomationDashboardStatsProps & InjectedIntlProps;

class ExitNodeAutomationDashboardStats extends React.Component<Props> {
  render() {
    const {
      intl: { formatMessage },
      nodeId,
      close,
    } = this.props;

    return (
      <ScenarioAnalyticsGenericDashboard
        dashboardTitle={formatMessage(messages.actionbarName)}
        close={close}
      >
        <UserPointsLineChart
          graphTitle={formatMessage(messages.upGraphTitle)}
          analyticsEntity={{
            analyticsEntityType: 'NODE',
            entityId: nodeId,
          }}
        />
      </ScenarioAnalyticsGenericDashboard>
    );
  }
}

export default compose<Props, ExitNodeAutomationDashboardStatsProps>(
  injectIntl,
)(ExitNodeAutomationDashboardStats);
