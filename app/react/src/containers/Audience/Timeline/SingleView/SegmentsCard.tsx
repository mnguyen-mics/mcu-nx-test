import * as React from 'react';
import { injectIntl, FormattedMessage, InjectedIntlProps } from 'react-intl';
import { Card } from '@mediarithmics-private/mcs-components-library';
import SegmentsTag from './SegmentsTag';
import messages from '../messages';
import { UserSegmentResource } from '../../../../models/timeline/timeline';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../Notifications/injectNotifications';
import { TimelinePageParams } from '../TimelinePage';

interface SegmentsCardProps {
  dataSource: UserSegmentResource[];
  isLoading: boolean;
}

interface State {
  showMore: boolean;
}

type Props = SegmentsCardProps &
  InjectedNotificationProps &
  InjectedIntlProps &
  RouteComponentProps<TimelinePageParams>;

class SegmentsCard extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      showMore: false,
    };
  }

  render() {
    const {
      intl: { formatMessage },
    } = this.props;

    const { dataSource: segments, isLoading } = this.props;

    let segmentsFormatted: UserSegmentResource[] = [];
    if (segments.length > 5 && !this.state.showMore) {
      segmentsFormatted = segmentsFormatted.concat(segments).splice(0, 5);
    } else {
      segmentsFormatted = segmentsFormatted.concat(segments);
    }

    const canViewMore = segments.length > 5 ? true : false;

    const onViewMoreClick = (e: any) => {
      e.preventDefault();
      this.setState({ showMore: true });
    };

    const onViewLessClick = (e: any) => {
      e.preventDefault();
      this.setState({ showMore: false });
    };

    return (
      <Card
        title={formatMessage(messages.segmentTitle)}
        isLoading={isLoading}
        className={'mcs-segmentCard'}
      >
        {segmentsFormatted.length > 0 &&
          segmentsFormatted.map(segment => {
            return <SegmentsTag key={segment.segment_id} segmentId={segment.segment_id} />;
          })}
        {segmentsFormatted.length === 0 && (
          <span>
            <FormattedMessage {...messages.emptySegment} />
          </span>
        )}
        {canViewMore ? (
          !this.state.showMore ? (
            <div className='mcs-card-footer'>
              <button
                className='mcs-card-footer-link mcs-segmentCard_viewMoreLink'
                onClick={onViewMoreClick}
              >
                <FormattedMessage {...messages.viewMore} />
              </button>
            </div>
          ) : (
            <div className='mcs-card-footer'>
              <button
                className='mcs-card-footer-link mcs-segmentCard_viewLessLink'
                onClick={onViewLessClick}
              >
                <FormattedMessage {...messages.viewLess} />.
              </button>
            </div>
          )
        ) : null}
      </Card>
    );
  }
}

export default compose<Props, SegmentsCardProps>(
  injectIntl,
  withRouter,
  injectNotifications,
)(SegmentsCard);
