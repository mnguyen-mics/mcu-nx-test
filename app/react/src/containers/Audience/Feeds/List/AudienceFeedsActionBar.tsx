import * as React from 'react';
import { InjectedIntlProps, injectIntl, FormattedMessage } from 'react-intl';
import { RouteComponentProps } from 'react-router';
import { InjectedDatamartProps, injectDatamart, injectWorkspace, InjectedWorkspaceProps } from '../../../Datamart';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../Notifications/injectNotifications';
import { compose } from 'recompose';
import ExportService from '../../../../services/ExportService';
import { Button, message } from 'antd';
import { parseSearch } from '../../../../utils/LocationSearchHelper';
import { FEEDS_SEARCH_SETTINGS } from './constants';
import { AudienceFeedType, IAudienceSegmentFeedService } from '../../../../services/AudienceSegmentFeedService';
import { Index } from '../../../../utils';
import { lazyInject } from '../../../../config/inversify.config';
import { TYPES } from '../../../../constants/types';
import { IAudienceSegmentService } from '../../../../services/AudienceSegmentService';
import messages from '../messages';
import { IAudienceTagFeedService } from '../../../../services/AudienceTagFeedService';
import { IAudienceExternalFeedService } from '../../../../services/AudienceExternalFeedService';
import { AudienceTagFeed } from '../../../../models/Plugins';
import { Actionbar, McsIcon } from '@mediarithmics-private/mcs-components-library';

type Props = RouteComponentProps<{ organisationId: string }> &
  InjectedIntlProps &
  InjectedDatamartProps &
  InjectedNotificationProps &
  InjectedWorkspaceProps;

interface State {
  exportRunning: boolean;
}

class AudienceFeedsActionBar extends React.Component<Props, State> {
  @lazyInject(TYPES.IAudienceSegmentService)
  private _audienceSegmentService: IAudienceSegmentService;

  @lazyInject(TYPES.IAudienceSegmentFeedServiceFactory)
  private _audienceSegmentFeedServiceFactory: (
    feedType: AudienceFeedType,
  ) => (segmentId: string) => IAudienceSegmentFeedService;

  private externalFeedService: IAudienceExternalFeedService;
  private tagFeedService: IAudienceTagFeedService;
  
  constructor(props: Props) {
    super(props);

    this.state = {
      exportRunning: false,
    }

    this.externalFeedService = this._audienceSegmentFeedServiceFactory(
      'EXTERNAL_FEED',
    )('');
    
    this.tagFeedService = this._audienceSegmentFeedServiceFactory(
      'TAG_FEED',
    )('');
  }

  buildApiSearchFilters = (filter: Index<any>) => {
    return {
      status: filter.status && filter.status.length > 0 ? filter.status : undefined,
      artifact_id: filter.artifactId && filter.artifactId.length > 0 ? filter.artifactId : undefined,
    };
  };

  handleExport = () => {
    const {
      match: {
        params: { organisationId },
      },
      location: { search },
      intl: {
        formatMessage
      },
      workspace,
    } = this.props;

    this.setState({ exportRunning : true });

    const filter = parseSearch(search, FEEDS_SEARCH_SETTINGS);
    const feedService = filter.feedType && filter.feedType[0] === 'TAG_FEED' ? this.tagFeedService : this.externalFeedService;

    const fetchFeeds = (feeds: AudienceTagFeed[]) : Promise<AudienceTagFeed[]> => {
      return feedService
      .getFeeds({
        first_result: feeds.length,
        organisation_id: organisationId,
        order_by: 'AUDIENCE_SEGMENT_NAME',
        max_results: 500,
        ...this.buildApiSearchFilters(filter),
      }).then(response => {
        if(response.data.length === 0)
          return feeds;

        const concat = feeds.concat(response.data)
        if(response.total && concat.length >= response.total)
          return concat;

        return fetchFeeds(concat);
      });
    }

    fetchFeeds([])
    .then(feedResults => {
      const audienceSegmentIds = feedResults
      .map(feeds => feeds.audience_segment_id)
      .filter((v, i, s) => s.indexOf(v) === i);

      return Promise.all(
        audienceSegmentIds.map(id => {
          return this._audienceSegmentService
            .getSegment(id)
            .catch(() => ({ data: undefined }));
        }),
      ).then(segmentResults => {
        const feeds = feedResults.map(feed => {
          return {
            feed: feed,
            audienceSegment: segmentResults
              .map(r => r.data)
              .find(segment => {
                return !!segment && segment.id === feed.audience_segment_id;
              }),
          }
        });

        this.setState({ exportRunning: false });

        ExportService.exportAudienceFeeds(
          feeds, 
          {
            feedType: filter.feedType && filter.feedType[0] === 'TAG_FEED' ? 'TAG_FEED' : 'EXTERNAL_FEED',
            artifactIds: filter.artifactId,
            status: filter.status,
          },
          workspace,
          formatMessage,
        );
      });
    })
    .catch(() => {
      this.setState({ exportRunning: false })
      message.error(
        formatMessage(messages.exportError),
        5,
      );
    });
  }

  render() {
    const {
      match: {
        params: { organisationId },
      },
      intl,
    } = this.props;

    const {
      exportRunning
    } = this.state;

    const breadcrumbPaths = [
      {
        name: intl.formatMessage(messages.audienceFeeds),
        path: `/v2/o/${organisationId}/audience/feeds`,
      },
      {
        name: intl.formatMessage(messages.audienceFeedsList),
        path: `/v2/o/${organisationId}/audience/feeds/list`,
      },
    ];

    return (
      <Actionbar paths={breadcrumbPaths}>
        <Button onClick={this.handleExport} loading={exportRunning}>
            <McsIcon type="download" />
            <FormattedMessage
              id="audience.feeds.actionbar.exportButton"
              defaultMessage="Export feed list"
            />
          </Button>
      </Actionbar>
    );
  }
}

export default compose<Props, {}>(
  injectIntl,
  injectDatamart,
  injectNotifications,
  injectWorkspace
)(AudienceFeedsActionBar);


