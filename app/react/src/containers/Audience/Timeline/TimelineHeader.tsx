import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import moment from 'moment';
import messages from './messages';
import ContentHeader from '../../../components/ContentHeader';
import { withRouter, RouteComponentProps } from 'react-router';
import { TimelinePageParams } from './TimelinePage';
import { compose } from 'recompose';
import { Identifier } from './Monitoring';
import { DatamartResource } from '../../../models/datamart/DatamartResource';
import { lazyInject } from '../../../config/inversify.config';
import { TYPES } from '../../../constants/types';
import { IUserDataService } from '../../../services/UserDataService';

interface State {
  lastSeen: number;
  loaded: boolean;
}

interface TimelineHeaderProps {
  selectedDatamart: DatamartResource;
  userPointId: string;
}

type Props = TimelineHeaderProps & RouteComponentProps<TimelinePageParams>;

class TimelineHeader extends React.Component<Props, State> {
  @lazyInject(TYPES.IUserDataService)
  private _userDataService: IUserDataService;

  constructor(props: Props) {
    super(props);
    this.state = {
      loaded: false,
      lastSeen: 0,
    };
  }

  componentDidMount() {
    this.getLastSeen();
  }

  getLastSeen() {
    this.setState({
      loaded: false,
      lastSeen: 0,
    });

    const { selectedDatamart, userPointId } = this.props;

    const identifier: Identifier = {
      id: userPointId,
      type: 'user_point_id',
    };

    this._userDataService
      .getActivities(selectedDatamart.id, identifier)
      .then(res => {
        const timestamps = res.data.map(item => {
          return item.$ts;
        });
        let lastSeen = 0;
        if (timestamps.length > 0) {
          lastSeen = Math.max.apply(null, timestamps);
        }
        this.setState({
          lastSeen: lastSeen,
          loaded: true,
        });
      });
  }

  render() {
    const { userPointId } = this.props;

    const { loaded, lastSeen } = this.state;

    const subtitle =
      loaded && lastSeen !== 0 ? (
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

export default compose<Props, TimelineHeaderProps>(withRouter)(TimelineHeader);
