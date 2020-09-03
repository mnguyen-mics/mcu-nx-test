import * as React from 'react';
import { compose } from 'recompose';
import { RouteComponentProps, withRouter } from 'react-router';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../../Notifications/injectNotifications';
import AudienceFeedForm from './AudienceFeedForm';
import { Loading } from '../../../../../components';
import { IAudienceFeedFormService } from './AudienceFeedFormService';
import { AudienceFeedFormModel, FeedRouteParams, FeedAction } from './domain';
import AudienceFeedSelector from './AudienceFeedSelector';
import { EditContentLayout } from '../../../../../components/Layout';
import messages from '../messages';
import { AudienceSegmentShape } from '../../../../../models/audiencesegment';
import { IAudienceSegmentService } from '../../../../../services/AudienceSegmentService';
import { TYPES } from '../../../../../constants/types';
import { lazyInject } from '../../../../../config/inversify.config';
import CreateFeedPresetSelectionPage from './CreateFeedPresetSelectionPage';
import { Path } from '@mediarithmics-private/mcs-components-library/lib/components/action-bar/Actionbar';
import { AudienceFeedType } from '../../../../../services/AudienceSegmentFeedService';

type JoinedProps = InjectedIntlProps &
  RouteComponentProps<FeedRouteParams> &
  InjectedNotificationProps;

interface AudienceFeedPageState {
  loading: boolean;
  edition: boolean;
  initialValue?: AudienceFeedFormModel;
  audienceSegment?: AudienceSegmentShape;
  type?: FeedAction;
}

class AudienceFeedPage extends React.Component<
  JoinedProps,
  AudienceFeedPageState
> {
  @lazyInject(TYPES.IAudienceSegmentService)
  private _audienceSegmentService: IAudienceSegmentService;
  @lazyInject(TYPES.IAudienceFeedFormService)
  private _audienceFeedFormService: IAudienceFeedFormService;

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

  componentDidUpdate(previousProps: JoinedProps) {
    const {
      match: {
        params: { segmentId, feedId, feedType },
      },
    } = this.props;
    const {
      match: {
        params: {
          segmentId: previousSegmentId,
          feedId: previousFeedId,
          feedType: previousFeedType,
        },
      },
    } = previousProps;

    if (
      (segmentId && segmentId !== previousSegmentId) ||
      feedId !== previousFeedId ||
      feedType !== previousFeedType
    ) {
      if (feedId && feedType) {
        this.fetchAudienceFeed(segmentId, feedType, feedId);
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

  onPresetSave = (feedType: AudienceFeedType) => {
    this.setState({
      type: feedType === 'EXTERNAL_FEED' ? 'create_external' : 'create_tag',
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

  onSelectFeedType = (feedType: FeedAction) => {
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
      return feedType === 'create_tag'
        ? 'AUDIENCE_SEGMENT_TAG_FEED'
        : 'AUDIENCE_SEGMENT_EXTERNAL_FEED';

    return type
      ? type === 'create_tag'
        ? 'AUDIENCE_SEGMENT_TAG_FEED'
        : 'AUDIENCE_SEGMENT_EXTERNAL_FEED'
      : 'AUDIENCE_SEGMENT_EXTERNAL_FEED';
  };

  render() {
    const {
      match: {
        params: { feedType, organisationId, segmentId, feedId },
      },
      intl: { formatMessage }
    } = this.props;

    const { loading, type } = this.state;

    if (loading) {
      return <Loading className="loading-full-screen" />;
    }

    const breadcrumbPaths: Path[] = [
      {
        name: formatMessage(messages.actionBarSegmentTitle),
        path: `/v2/o/${organisationId}/audience/segments`,
      },
      {
        name:
          this.state.audienceSegment && this.state.audienceSegment.name
            ? this.state.audienceSegment.name
            : '',
        path: `/v2/o/${organisationId}/audience/segments/${segmentId}`,
      },
    ];

    const feedBreadcrumbPaths: Path[] = breadcrumbPaths.concat({
      name: feedId
        ? formatMessage(messages.actionBarSegmentFeedsEdit)
        : formatMessage(messages.actionBarSegmentFeedsCreate),
    });

    if (!feedType && !type) {
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

    if (type === 'create_external_preset' || type === 'create_tag_preset') {
      const presetBreadcrumbPaths: Path[] = breadcrumbPaths.concat({
        name: formatMessage(messages.actionBarSegmentPresetCreate),
      });

      return (
        <CreateFeedPresetSelectionPage
          feedType={
            type === 'create_external_preset' ? 'EXTERNAL_FEED' : 'TAG_FEED'
          }
          breadcrumbPaths={presetBreadcrumbPaths}
          onClose={this.onClose}
          onPresetSave={this.onPresetSave}
        />
      );
    }

    return (
      <AudienceFeedForm
        onClose={this.onClose}
        initialValues={this.state.initialValue}
        onSave={this.save}
        breadcrumbPaths={feedBreadcrumbPaths}
        type={this.getFeedType()}
      />
    );
  }
}

export default compose<JoinedProps, {}>(
  injectIntl,
  injectNotifications,
  withRouter,
)(AudienceFeedPage);
