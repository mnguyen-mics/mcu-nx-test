import * as React from 'react';
import { compose } from 'recompose';
import { RouteComponentProps, withRouter } from 'react-router';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import injectNotifications, { InjectedNotificationProps } from '../../../../Notifications/injectNotifications';
import AudienceFeedForm from './AudienceFeedForm';
import { Loading } from '../../../../../components';
import { AudienceFeedFormService } from './AudienceFeedFormService';
import { AudienceFeedFormModel } from './domain';
import AudienceFeedSelector, { FeedType } from './AudienceFeedSelector';
import { EditContentLayout } from '../../../../../components/Layout';
import messages from '../messages';
import { AudienceSegmentShape } from '../../../../../models/audiencesegment';
import AudienceSegmentService from '../../../../../services/AudienceSegmentService';

export interface AudienceFeedPageProps {
}

type JoinedProps = AudienceFeedPageProps & InjectedIntlProps & RouteComponentProps<{ organisationId: string, segmentId: string, feedId: string, feedType: FeedType }> & InjectedNotificationProps

interface AudienceFeedPageState {
  loading: boolean;
  edition: boolean;
  initialValue?: AudienceFeedFormModel;
  audienceSegment?: AudienceSegmentShape;
  type?: FeedType;
}

class AudienceFeedPage extends React.Component<JoinedProps, AudienceFeedPageState> {

  constructor(props: JoinedProps) {
    super(props)
    this.state = {
      loading: true,
      edition: !!props.match.params.feedId && !!props.match.params.feedType,
    }
  }

  componentDidMount() {
    const {
      match: { params: { segmentId, feedId, feedType } },
    } = this.props;
    if (segmentId) {
      this.fetchAudienceSegment(segmentId)
    }
    if (segmentId && feedId && feedType) {
      this.fetchAudienceFeed(segmentId, feedType, feedId)
    } else {
      this.setState({ loading: false });
    }
  }

  componentWillReceiveProps(nextProps: JoinedProps) {
    const {
      match: { params: { segmentId, feedId, feedType } },
    } = this.props;
    const {
      match: { params: { segmentId: nextSegmentId, feedId: nextFeedId, feedType: nextFeedType } },
    } = nextProps;

    if (segmentId !== nextSegmentId || feedId !== nextFeedId || feedType !== nextFeedType) {
      if (nextFeedId && nextFeedType) {
        this.fetchAudienceFeed(nextSegmentId, nextFeedType, nextFeedId)
      }
      this.fetchAudienceSegment(segmentId)
    }

  }

  fetchAudienceFeed = (segmentId: string, feedType: string, feedId: string) => {
    if (feedType === 'tag') {
      AudienceFeedFormService.loadTagInitialValue(
        segmentId,
        feedId,
      )
        .then(res => this.setState({ initialValue: res, loading: false }))
        .catch(err => {
          this.setState({ loading: false });
          this.props.notifyError(err);
        });
    }
    if (feedType === 'external') {
      AudienceFeedFormService.loadExternalInitialValue(
        segmentId,
        feedId,
      )
        .then(res => this.setState({ initialValue: res, loading: false }))
        .catch(err => {
          this.setState({ loading: false });
          this.props.notifyError(err);
        });
    }
  }


  fetchAudienceSegment = (segmentId: string) => {
    return AudienceSegmentService.getSegment(segmentId)
      .then(res => res.data)
      .then(res => this.setState({ audienceSegment: res }))
  }


  save = (formData: AudienceFeedFormModel) => {
    const {
      match: { params: { feedType, segmentId, organisationId } },
      history,
      notifyError
    } = this.props;

    const type: FeedType = feedType ? feedType : this.state.type!;
    if (type === 'tag') {
      this.setState({ loading: true })
      return AudienceFeedFormService.saveOrCreateTagFeed(
        organisationId,
        segmentId,
        formData,
        this.state.edition
      )
        .then(() => history.push({ pathname: `/v2/o/${organisationId}/audience/segments/${segmentId}`, state: { scrollToFeed: true } }))
        .catch((err) => {
          this.setState({ loading: false })
          notifyError(err)
        })
    } else if (type === 'external') {
      this.setState({ loading: true })
      return AudienceFeedFormService.saveOrCreateExternalFeed(
        organisationId,
        segmentId,
        formData,
        this.state.edition
      )
        .then(() => history.push({ pathname: `/v2/o/${organisationId}/audience/segments/${segmentId}`, state: { scrollToFeed: true } }))
        .catch((err) => {
          this.setState({ loading: false })
          notifyError(err)
        })
    }
    return;
  }

  onClose = () => {
    const {
      history,
      match: { params: { segmentId, organisationId } },
    } = this.props;

    return history.push(`/v2/o/${organisationId}/audience/segments/${segmentId}`);
  };

  onSelectFeedType = (feedType: FeedType) => {
    this.setState({ type: feedType })
  }

  getFeedType = () => {
    const {
      match: { params: { feedType } }
    } = this.props;

    const {
      type
    } = this.state;

    if (feedType) return feedType === 'tag' ? 'AUDIENCE_SEGMENT_TAG_FEED' : 'AUDIENCE_SEGMENT_EXTERNAL_FEED';

    return type ? type === 'tag' ? 'AUDIENCE_SEGMENT_TAG_FEED' : 'AUDIENCE_SEGMENT_EXTERNAL_FEED' : 'AUDIENCE_SEGMENT_EXTERNAL_FEED';
  }

  render() {

    const {
      match: { params: { feedType, organisationId, segmentId, feedId } }
    } = this.props;

    if (this.state.loading) {
      return <Loading className="loading-full-screen" />
    }

    const type = this.getFeedType();

    const breadcrumbPaths = [
      {
        name: messages.actionBarSegmentTitle,
        path: `/v2/o/${organisationId}/audience/segments`,
      },
      {
        name: this.state.audienceSegment && this.state.audienceSegment.name ? this.state.audienceSegment.name : '',
        path: `/v2/o/${organisationId}/audience/segments/${segmentId}`,
      },
      {
        name: feedId ? messages.actionBarSegmentFeedsEdit : messages.actionBarSegmentFeedsCreate,
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
        </EditContentLayout>)
    }

    return (
      <AudienceFeedForm
        initialValues={this.state.initialValue}
        edition={this.state.edition}
        onClose={this.onClose}
        onSave={this.save}
        type={type}
        identifier={type}
        breadcrumbPaths={breadcrumbPaths}
      />
    );
  }
}

export default compose<JoinedProps, {}>(
  injectIntl,
  injectNotifications,
  withRouter,
)(AudienceFeedPage)
