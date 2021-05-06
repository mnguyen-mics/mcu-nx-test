import * as React from 'react';
import { defineMessages, InjectedIntlProps, injectIntl } from 'react-intl';
import { compose } from 'recompose';
import UserPointsLineChart from '../NodeCharts/UserPointsLineChart';
import ScenarioAnalyticsGenericDashboard from '../ScenarioAnalyticsGenericDashboard/ScenarioAnalyticsGenericDashboard';

const messages = defineMessages({
  actionbarName: {
    id: 'automation.entryNode.dashboard.stats.actionbar.name',
    defaultMessage: 'Entry node stats',
  },
  upGraphTitle: {
    id: 'automation.entryNode.dashboard.stats.graphs.upLineGraph.title',
    defaultMessage: 'Number of users entering the scenario',
  },
});

export interface EntryNodeAutomationDashboardStatsProps {
  datamartId: string;
  nodeId: string;
  close: () => void;
}

type Props = EntryNodeAutomationDashboardStatsProps & InjectedIntlProps;

class EntryNodeAutomationDashboardStats extends React.Component<Props> {
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

export default compose<Props, EntryNodeAutomationDashboardStatsProps>(injectIntl)(
  EntryNodeAutomationDashboardStats,
);
