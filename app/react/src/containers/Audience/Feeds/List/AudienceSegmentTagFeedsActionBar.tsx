import * as React from 'react';
import { InjectedIntlProps, injectIntl, defineMessages } from 'react-intl';
import { RouteComponentProps } from 'react-router';
import { InjectedDatamartProps, injectDatamart } from '../../../Datamart';
import injectNotifications, { InjectedNotificationProps } from '../../../Notifications/injectNotifications';
import { compose } from 'recompose';
import Actionbar from '../../../../components/ActionBar';

type Props = RouteComponentProps<{ organisationId: string }> &
  InjectedIntlProps &
  InjectedDatamartProps &
  InjectedNotificationProps;

interface State {
  exportIsRunning: boolean;
}

const messages = defineMessages({
	audienceFeeds: {
	  id: 'audiencefeeds.actionbar.tagFeeds',
	  defaultMessage: 'Tag Feeds',
	}
});

class AudienceSegmentTagFeedsActionBar extends React.Component<Props, State> {
	render() {
		const {
			match: {
				params: { organisationId },
			},
			intl,
		} = this.props;

		const breadcrumbPaths = [
			{
			  name: intl.formatMessage(messages.audienceFeeds),
			  path: `/v2/o/${organisationId}/audience/tag_feeds`,
			},
		];

		return (
			<Actionbar paths={breadcrumbPaths}/>
		);
	}
}

export default compose<Props, {}>(
	injectIntl,
	injectDatamart,
	injectNotifications,
)(AudienceSegmentTagFeedsActionBar);