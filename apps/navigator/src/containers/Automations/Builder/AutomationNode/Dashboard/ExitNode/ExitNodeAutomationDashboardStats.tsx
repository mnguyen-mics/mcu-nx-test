import * as React from 'react';
import { defineMessages, WrappedComponentProps, injectIntl } from 'react-intl';
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
    defaultMessage: 'Number of users leaving the scenario at this node',
  },
});

export interface ExitNodeAutomationDashboardStatsProps {
  datamartId: string;
  nodeId: string;
  close: () => void;
}

type Props = ExitNodeAutomationDashboardStatsProps & WrappedComponentProps;

class ExitNodeAutomationDashboardStats extends React.Component<Props> {
  render() {
    const {
      intl: { formatMessage },
      nodeId,
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
            analyticsEntityType: 'NODE',
            entityId: nodeId,
          }}
        />
      </ScenarioAnalyticsGenericDashboard>
    );
  }
}

export default compose<Props, ExitNodeAutomationDashboardStatsProps>(injectIntl)(
  ExitNodeAutomationDashboardStats,
);
