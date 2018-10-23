import * as React from 'react';
import { compose } from 'recompose';
import { RouteComponentProps, withRouter } from 'react-router';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../../Notifications/injectNotifications';
import AudienceFeedForm from './AudienceFeedForm';
import { Loading } from '../../../../../components';
import {
  AudienceFeedFormService,
  IAudienceFeedFormService,
} from './AudienceFeedFormService';
import { AudienceFeedFormModel, FeedRouteParams, FeedType } from './domain';
import AudienceFeedSelector from './AudienceFeedSelector';
import { EditContentLayout } from '../../../../../components/Layout';
import messages from '../messages';
import { AudienceSegmentShape } from '../../../../../models/audiencesegment';
import {
  SERVICE_IDENTIFIER,
  lazyInject,
} from '../../../../../services/inversify.config';
import { IAudienceSegmentService } from '../../../../../services/AudienceSegmentService';
import { injectable } from 'inversify';

export interface AudienceFeedPageProps {}

type JoinedProps = AudienceFeedPageProps &
  InjectedIntlProps &
  RouteComponentProps<FeedRouteParams> &
  InjectedNotificationProps;

interface AudienceFeedPageState {
  loading: boolean;
  edition: boolean;
  initialValue?: AudienceFeedFormModel;
  audienceSegment?: AudienceSegmentShape;
  type?: FeedType;
}

@injectable()
class AudienceFeedPage extends React.Component<
  JoinedProps,
  AudienceFeedPageState
> {
  @lazyInject(SERVICE_IDENTIFIER.IAudienceSegmentService)
  private _audienceSegmentService: IAudienceSegmentService;
  private _audienceFeedFormService: IAudienceFeedFormService = new AudienceFeedFormService();

  constructor(props: JoinedProps) {
    super(props);
    this.state = {
      loading: true,
      edition: !!props.match.params.feedId && !!props.match.params.feedType,
    };
  }

  componentDidMount() {
    const {
      match: {
        params: { segmentId, feedId, feedType },
      },
    } = this.props;
    if (segmentId) {
      this.fetchAudienceSegment(segmentId);
    }
    if (segmentId && feedId && feedType) {
      this.fetchAudienceFeed(segmentId, feedType, feedId);
    } else {
      this.setState({ loading: false });
    }
  }

  componentWillReceiveProps(nextProps: JoinedProps) {
    const {
      match: {
        params: { segmentId, feedId, feedType },
      },
    } = this.props;
    const {
      match: {
        params: {
          segmentId: nextSegmentId,
          feedId: nextFeedId,
          feedType: nextFeedType,
        },
      },
    } = nextProps;

    if (
      segmentId !== nextSegmentId ||
      feedId !== nextFeedId ||
      feedType !== nextFeedType
    ) {
      if (nextFeedId && nextFeedType) {
        this.fetchAudienceFeed(nextSegmentId, nextFeedType, nextFeedId);
      }
      this.fetchAudienceSegment(segmentId);
    }
  }

  fetchAudienceFeed = (segmentId: string, feedType: string, feedId: string) => {
    if (feedType === 'tag') {
      this._audienceFeedFormService
        .loadTagInitialValue(segmentId, feedId)
        .then(res => this.setState({ initialValue: res, loading: false }))
        .catch(err => {
          this.setState({ loading: false });
          this.props.notifyError(err);
        });
    }
    if (feedType === 'external') {
      this._audienceFeedFormService
        .loadExternalInitialValue(segmentId, feedId)
        .then(res => this.setState({ initialValue: res, loading: false }))
        .catch(err => {
          this.setState({ loading: false });
          this.props.notifyError(err);
        });
    }
  };

  fetchAudienceSegment = (segmentId: string) => {
    return this._audienceSegmentService
      .getSegment(segmentId)
      .then(res => res.data)
      .then(res => this.setState({ audienceSegment: res }));
  };

  save = (formData: AudienceFeedFormModel) => {
    const {
      match: {
        params: { segmentId, organisationId },
      },
      history,
    } = this.props;

    history.push({
      pathname: `/v2/o/${organisationId}/audience/segments/${segmentId}`,
      state: { scrollToFeed: true },
    });
  };

  onClose = () => {
    const {
      history,
      match: {
        params: { segmentId, organisationId },
      },
    } = this.props;

    return history.push(
      `/v2/o/${organisationId}/audience/segments/${segmentId}`,
    );
  };

  onSelectFeedType = (feedType: FeedType) => {
    this.setState({ type: feedType });
  };

  getFeedType = () => {
    const {
      match: {
        params: { feedType },
      },
    } = this.props;

    const { type } = this.state;

    if (feedType)
      return feedType === 'tag'
        ? 'AUDIENCE_SEGMENT_TAG_FEED'
        : 'AUDIENCE_SEGMENT_EXTERNAL_FEED';

    return type
      ? type === 'tag'
        ? 'AUDIENCE_SEGMENT_TAG_FEED'
        : 'AUDIENCE_SEGMENT_EXTERNAL_FEED'
      : 'AUDIENCE_SEGMENT_EXTERNAL_FEED';
  };

  render() {
    const {
      match: {
        params: { feedType, organisationId, segmentId, feedId },
      },
    } = this.props;

    if (this.state.loading) {
      return <Loading className="loading-full-screen" />;
    }

    const type = this.getFeedType();

    const breadcrumbPaths = [
      {
        name: messages.actionBarSegmentTitle,
        path: `/v2/o/${organisationId}/audience/segments`,
      },
      {
        name:
          this.state.audienceSegment && this.state.audienceSegment.name
            ? this.state.audienceSegment.name
            : '',
        path: `/v2/o/${organisationId}/audience/segments/${segmentId}`,
      },
      {
        name: feedId
          ? messages.actionBarSegmentFeedsEdit
          : messages.actionBarSegmentFeedsCreate,
      },
    ];

    if (!feedType && !this.state.type) {
      const actionbarProps = {
        onClose: this.onClose,
        formId: 'audienceSegmentForm',
      };

      return (
        <EditContentLayout paths={breadcrumbPaths} {...actionbarProps}>
          <AudienceFeedSelector onSelect={this.onSelectFeedType} />
        </EditContentLayout>
      );
    }

    return (
      <AudienceFeedForm
        onClose={this.onClose}
        initialValues={this.state.initialValue}
        onSave={this.save}
        breadcrumbPaths={breadcrumbPaths}
        type={type}
      />
    );
  }
}

export default compose<JoinedProps, {}>(
  injectIntl,
  injectNotifications,
  withRouter,
)(AudienceFeedPage);
