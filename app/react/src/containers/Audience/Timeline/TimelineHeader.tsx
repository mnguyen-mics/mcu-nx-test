import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import moment from 'moment';
import messages from './messages';
import ContentHeader from '../../../components/ContentHeader';
import { IdentifiersProps, UserAgent } from '../../../models/timeline/timeline';

interface TimelineHeaderProps {
  datamartId: string;
  identifiers: IdentifiersProps;
  userPointId: string;
}

type Props = TimelineHeaderProps;

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
    const { identifiers, userPointId } = this.props;
    const userId = {
      id: userPointId,
      lastSeen: this.getLastSeen(identifiers.items.USER_AGENT),
    };
    const lastSeen =
      userId.lastSeen !== '' ? (
        <span>
          <FormattedMessage {...messages.lastSeen} />{' '}
          {moment(parseInt(userId.lastSeen, 0)).format('YYYY-MM-DD, HH:mm:ss')}
        </span>
      ) : null;

    return userPointId ? (
      <ContentHeader title={userPointId} subTitle={lastSeen} />
    ) : null;
  }
}

export default TimelineHeader;
