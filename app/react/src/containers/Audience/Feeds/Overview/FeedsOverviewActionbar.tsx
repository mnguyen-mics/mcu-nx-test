import * as React from 'react';
import { InjectedIntlProps, injectIntl, defineMessages, FormattedMessage } from 'react-intl';
import { RouteComponentProps } from 'react-router';
import { InjectedDatamartProps, injectDatamart } from '../../../Datamart';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../Notifications/injectNotifications';
import { compose } from 'recompose';
import { Button } from 'antd';
import { Actionbar } from '@mediarithmics-private/mcs-components-library';

type Props = RouteComponentProps<{ organisationId: string }> &
  InjectedIntlProps &
  InjectedDatamartProps &
  InjectedNotificationProps;

const messages = defineMessages({
  audienceFeeds: {
    id: 'audiencefeedsOverview.actionbar.title',
    defaultMessage: 'Feeds Overview',
  },
});

class FeedsOverviewActionBar extends React.Component<Props, {}> {
  render() {
    const {
      history,
      match: {
        params: { organisationId },
      },
      intl,
    } = this.props;

    const breadcrumbPaths = [
      {
        name: intl.formatMessage(messages.audienceFeeds),
        path: `/v2/o/${organisationId}/audience/feeds`,
      },
    ];

    const viewDetails = () => {
      return history.push(`/v2/o/${organisationId}/audience/feeds/list`);
    };

    return (
      <Actionbar paths={breadcrumbPaths}>

        <Button onClick={viewDetails}>
          <FormattedMessage
            id="audiencefeedsOverview.actionbar.view-details"
            defaultMessage="View Details"
          />
        </Button>

      </Actionbar >
    );
  }
}

export default compose<Props, {}>(
  injectIntl,
  injectDatamart,
  injectNotifications,
)(FeedsOverviewActionBar);
