import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import moment from 'moment';
import messages from './messages';
import { ContentHeader } from '@mediarithmics-private/mcs-components-library';
import { withRouter, RouteComponentProps } from 'react-router';
import { TimelinePageParams } from './TimelinePage';
import { compose } from 'recompose';
import { MonitoringData } from '../../../models/timeline/timeline';

interface TimelineHeaderProps {
  dataSource: MonitoringData;
  isLoading: boolean;
}

type Props = TimelineHeaderProps & RouteComponentProps<TimelinePageParams>;

class TimelineHeader extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  render() {
    const { dataSource, isLoading } = this.props;
    const lastSeen = dataSource.lastSeen;
    const identifierId = dataSource.userIdentifier.id;

    const subtitle = !isLoading && lastSeen !== 0 && (
      <span>
        <FormattedMessage {...messages.lastSeen} />{' '}
        {moment(lastSeen).format('YYYY-MM-DD, HH:mm:ss')}
      </span>
    );

    return identifierId && <ContentHeader title={identifierId} subTitle={subtitle} />;
  }
}

export default compose<Props, TimelineHeaderProps>(withRouter)(TimelineHeader);
