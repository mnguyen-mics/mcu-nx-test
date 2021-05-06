import * as React from 'react';
import {
  AudienceTagFeedTyped,
  AudienceExternalFeedTyped,
  AudienceFeedTyped,
} from '../../Edit/domain';
import { Row, Col } from 'antd';
import FeedCard from './FeedCard';
import FeedPlaceholder from './FeedPlaceholder';
import { RouteComponentProps, StaticContext, withRouter } from 'react-router';
import { compose } from 'recompose';
import { IAudienceSegmentService } from '../../../../../services/AudienceSegmentService';
import { TYPES } from '../../../../../constants/types';
import { lazyInject } from '../../../../../config/inversify.config';
import { ContentHeader } from '@mediarithmics-private/mcs-components-library';
import { IFeedsStatsService } from '../../../../../services/FeedsStatsService';
import { normalizeReportView } from '../../../../../utils/MetricHelper';
import { normalizeArrayOfObject } from '../../../../../utils/Normalizer';
import { Index } from '../../../../../utils';
import { InjectedFeaturesProps, injectFeatures } from '../../../../Features';

type Props = InjectedFeaturesProps &
  RouteComponentProps<
    { organisationId: string; segmentId: string },
    StaticContext,
    { scrollToFeed?: boolean }
  >;

export interface FeedCardListState {
  isLoading: boolean;
  feeds: AudienceFeedTyped[];
  shouldScrollWhenLoaded: boolean;
  feedsStatsByFeedId: Index<{
    feed_id: string;
    uniq_user_points_count: number;
    uniq_user_identifiers_count: number;
  }>;
}

class FeedCardList extends React.Component<Props, FeedCardListState> {
  @lazyInject(TYPES.IAudienceSegmentService)
  private _audienceSegmentService: IAudienceSegmentService;

  @lazyInject(TYPES.IFeedsStatsService)
  private _feedsStatsService: IFeedsStatsService;

  constructor(props: Props) {
    super(props);
    this.state = {
      isLoading: true,
      feeds: [],
      shouldScrollWhenLoaded:
        props.location.state && props.location.state.scrollToFeed ? true : false,
      feedsStatsByFeedId: {},
    };
  }

  componentDidMount() {
    const {
      match: {
        params: { segmentId },
      },
      hasFeature,
    } = this.props;

    if (segmentId) {
      this.fetchFeeds(segmentId);
      if (hasFeature('audience-feeds_stats')) {
        this.fetchFeedsStats();
      }
    }
  }

  componentDidUpdate(previousProps: Props) {
    const {
      match: {
        params: { segmentId },
      },
    } = this.props;
    const {
      match: {
        params: { segmentId: previousSegmentId },
      },
    } = previousProps;

    if (segmentId !== previousSegmentId) {
      this.fetchFeeds(segmentId);
    }
  }

  fetchFeeds = (segmentId: string) => {
    this.setState({ isLoading: true });
    const externalFeeds = this._audienceSegmentService
      .getAudienceExternalFeeds(segmentId)
      .then(res => res.data);
    const tagFeeds = this._audienceSegmentService
      .getAudienceTagFeeds(segmentId)
      .then(res => res.data);
    return Promise.all([externalFeeds, tagFeeds]).then(res => {
      const externalTypedFeed: AudienceExternalFeedTyped[] = res[0].map(ef => {
        const myTypedFeed = { ...ef, type: 'EXTERNAL_FEED' };
        return myTypedFeed as AudienceExternalFeedTyped;
      });
      const tagTypedFeed: AudienceTagFeedTyped[] = res[1].map(ef => {
        const myTypedFeed: AudienceTagFeedTyped = { ...ef, type: 'TAG_FEED' };
        return myTypedFeed;
      });
      const feeds: AudienceFeedTyped[] = externalTypedFeed;
      tagTypedFeed.forEach(f => feeds.push(f));
      this.setState({
        isLoading: false,
        feeds: feeds.sort((a, b) => a.id.localeCompare(b.id)),
      });
    });
  };

  onFeedDelete = (feed: AudienceFeedTyped) => {
    const newFeeds = this.state.feeds.filter(
      f => !(f.id === feed.id && f.artifact_id === feed.artifact_id),
    );
    this.setState({
      feeds: newFeeds,
    });
  };

  onFeedUpdate = (feed: AudienceFeedTyped) => {
    const newFeeds = this.state.feeds.map(f => {
      if (f.id === feed.id && f.artifact_id === feed.artifact_id) {
        return feed;
      }
      return f;
    });
    this.setState({
      feeds: newFeeds,
    });
  };

  getRef = (div: HTMLDivElement | null) => {
    const { shouldScrollWhenLoaded } = this.state;

    if (div && shouldScrollWhenLoaded) {
      div.scrollIntoView({
        block: 'end',
        behavior: 'smooth',
        inline: 'end',
      });
      this.setState({ shouldScrollWhenLoaded: false });
    }
  };

  fetchFeedsStats = () => {
    const {
      match: {
        params: { segmentId, organisationId },
      },
    } = this.props;

    return this._feedsStatsService.getSegmentStats(organisationId, segmentId).then(res => {
      const normalized = normalizeReportView<{
        feed_id: string;
        uniq_user_points_count: number;
        uniq_user_identifiers_count: number;
      }>(res.data.report_view);

      const normalizedObjects = normalizeArrayOfObject(normalized, 'feed_id');

      // For each feed that doesn't have any stats in the response, we add it with '0' identifiers count.
      this.state.feeds.forEach(feed => {
        if (!normalizedObjects[feed.id]) {
          normalizedObjects[feed.id] = {
            feed_id: feed.id,
            uniq_user_points_count: 0,
            uniq_user_identifiers_count: 0,
          };
        }
      });

      return this.setState({
        feedsStatsByFeedId: normalizedObjects,
      });
    });
  };

  render() {
    const {
      match: {
        params: { segmentId, organisationId },
      },
    } = this.props;

    const { feeds, isLoading, feedsStatsByFeedId } = this.state;

    if (isLoading) {
      return (
        <Row gutter={24}>
          <Col span={8}>
            <FeedPlaceholder />
          </Col>
          <Col span={8}>
            <FeedPlaceholder />
          </Col>
          <Col span={8}>
            <FeedPlaceholder />
          </Col>
        </Row>
      );
    }

    return (
      <div ref={this.getRef}>
        {feeds.length >= 1 && <ContentHeader title={`Feeds`} size={`medium`} />}
        <Row gutter={24}>
          {feeds &&
            feeds.map(cf => {
              return (
                <Col span={8} key={`${cf.id}${cf.artifact_id}`}>
                  <FeedCard
                    feed={cf}
                    onFeedDelete={this.onFeedDelete}
                    onFeedUpdate={this.onFeedUpdate}
                    segmentId={segmentId}
                    organisationId={organisationId}
                    exportedUserPointsCount={
                      feedsStatsByFeedId[cf.id]
                        ? feedsStatsByFeedId[cf.id].uniq_user_points_count
                        : undefined
                    }
                    exportedUserIdentifiersCount={
                      feedsStatsByFeedId[cf.id]
                        ? feedsStatsByFeedId[cf.id].uniq_user_identifiers_count
                        : undefined
                    }
                  />
                </Col>
              );
            })}
        </Row>
      </div>
    );
  }
}

export default compose<Props, {}>(withRouter, injectFeatures)(FeedCardList);
