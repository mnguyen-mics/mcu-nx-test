import React from "react";
import { RouteComponentProps, withRouter } from "react-router";
import injectNotifications, { InjectedNotificationProps } from "../../../../../Notifications/injectNotifications";
import { InjectedIntlProps, injectIntl, defineMessages } from "react-intl";
import { compose } from "recompose";
import { Actionbar, McsIcon, Card } from "@mediarithmics-private/mcs-components-library";
import FeedChart from "../../../../../Audience/Segments/Dashboard/Feeds/Charts/FeedChart";

export interface FeedNodeAutomationDashboardStatsProps {
  feedId: string;
  close: () => void;
}

type Props = InjectedIntlProps &
  InjectedNotificationProps &
  RouteComponentProps<{ organisationId: string }> &
  FeedNodeAutomationDashboardStatsProps

type State = {}

class FeedNodeAutomationDashboardStats extends React.Component<
  Props,
  State
> {
  
  render() {
    const {
      intl: {
        formatMessage,
      },
      match: {
        params: { organisationId },
      },
      feedId,
    } = this.props;

    return (
      <div className="mcs-feedNodeAutomationDashboardStats ant-layout">
        <Actionbar
          paths={[
            {
              name: formatMessage(messages.actionbarName),
            },
          ]}
          edition={true}>
          <McsIcon
            type="close"
            className="close-icon"
            style={{ cursor: 'pointer' }}
            onClick={this.props.close}
          />
        </Actionbar>
        <div className="mcs-feedNodeAutomationDashboardStats_content ant-layout ant-layout-content mcs-content-container">
          <Card>
            <FeedChart organisationId={organisationId} feedId={feedId} feedStatsUnit="USER_POINTS" />
          </Card>
        </div>
      </div>
    );
  }
}

const messages = defineMessages({
  actionbarName: {
    id: 'automation.feedNode.dashboard.stats.actionbar.name',
    defaultMessage: 'Feed stats',
  },
});

export default compose<Props, FeedNodeAutomationDashboardStatsProps>(
  withRouter,
  injectIntl,
  injectNotifications,
)(FeedNodeAutomationDashboardStats);