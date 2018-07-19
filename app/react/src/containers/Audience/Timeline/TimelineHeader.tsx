import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import moment from 'moment';
import messages from './messages';
import ContentHeader from '../../../components/ContentHeader';
import { RouteComponentProps, withRouter } from 'react-router';
import { IdentifiersProps, UserAgent } from '../../../models/timeline/timeline';
import { compose } from 'recompose';

interface TimelineHeaderProps {
  datamartId: string;
  identifiers: IdentifiersProps;
}

type Props = TimelineHeaderProps &
  RouteComponentProps<{ organisationId: string }>;

class TimelineHeader extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  getLastSeen = (userAgents: UserAgent[]) => {
    if (userAgents) {
      const formattedAgents = userAgents.map(item => {
        return item.last_activity_ts;
      });
      return Math.max.apply(null, formattedAgents);
    }
    return 0;
  };

  render() {
    const { identifiers } = this.props;
    const userId = {
      id:
        identifiers.items.USER_POINT && identifiers.items.USER_POINT[0]
          ? identifiers.items.USER_POINT[0].user_point_id
          : '',
      lastSeen: this.getLastSeen(identifiers.items.USER_AGENT),
    };
    const lastSeen =
      userId.lastSeen !== '' ? (
        <span>
          <FormattedMessage {...messages.lastSeen} />{' '}
          {moment(parseInt(userId.lastSeen, 0)).format('YYYY-MM-DD, HH:mm:ss')}
        </span>
      ) : null;

    return userId.id && userId.lastSeen ? (
      <ContentHeader title={userId.id} subTitle={lastSeen} />
    ) : null;
  }
}

export default compose<Props, TimelineHeaderProps>(withRouter)(TimelineHeader);
