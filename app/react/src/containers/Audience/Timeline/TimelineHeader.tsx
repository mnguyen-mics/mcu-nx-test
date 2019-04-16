import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import moment from 'moment';
import messages from './messages';
import ContentHeader from '../../../components/ContentHeader';
import { Identifier } from './Monitoring';
import UserDataService from '../../../services/UserDataService';
import { withRouter, RouteComponentProps } from 'react-router';
import { TimelinePageParams } from './TimelinePage';
import { compose } from 'recompose';

interface State {
  lastSeen: number;
  loaded: boolean;
}

interface TimelineHeaderProps {
  datamartId: string;
  identifier: Identifier;
  userPointId: string;
}

type Props = TimelineHeaderProps &
  RouteComponentProps<TimelinePageParams>;

class TimelineHeader extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      loaded: false,
      lastSeen: 0
    };
  }

  componentDidMount() {
    this.getLastSeen()
  }

  getLastSeen() {
    this.setState({
      loaded: false,
      lastSeen: 0
    });

    const {
      datamartId,
      identifier,
    } = this.props;

    UserDataService.getActivities(datamartId, identifier).then(res => {
      const timestamps = res.data.map(item => {
        return item.$ts
      })
      let lastSeen = 0;
      if (timestamps.length > 0) {
        lastSeen = Math.max.apply(null, timestamps);
      }
      this.setState({
        'lastSeen': lastSeen,
        'loaded': true
      });
    });
  };

  render() {

    const {
      userPointId,
    } = this.props;

    const { loaded, lastSeen } = this.state

    const subtitle =
      loaded && lastSeen !== 0
        ? (
          <span>
            <FormattedMessage {...messages.lastSeen} />{' '}
            {moment(lastSeen).format('YYYY-MM-DD, HH:mm:ss')}
          </span>
        ) : null;

    return userPointId ? (
      <ContentHeader title={userPointId} subTitle={subtitle} />
    ) : null;
  }
}

export default compose<Props, TimelineHeaderProps>(
  withRouter
)(TimelineHeader);