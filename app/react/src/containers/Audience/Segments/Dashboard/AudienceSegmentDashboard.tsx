import * as React from 'react';
import { compose } from 'recompose';
import { withRouter, RouteComponentProps } from 'react-router';

import { Card } from '../../../../components/Card';
import McsTabs from '../../../../components/McsTabs';
import { Overview, AdditionDeletion, Overlap } from './Charts';
import { EditAudienceSegmentParam } from '../Edit/domain';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../Notifications/injectNotifications';
import UserListImportCard from './UserListImportCard';
import { InjectedIntlProps, injectIntl, defineMessages } from 'react-intl';
import AudienceCounters from './AudienceCounters';
import { AudienceSegmentResource } from '../../../../models/audiencesegment/AudienceSegmentResource';
import ReportService, { Filter } from '../../../../services/ReportService';
import McsMoment from '../../../../utils/McsMoment';
import { normalizeReportView } from '../../../../utils/MetricHelper';
import {
  parseSearch,
  compareSearches,
} from '../../../../utils/LocationSearchHelper';
import { SEGMENT_QUERY_SETTINGS, AudienceReport } from './constants';
import FeedCardList from './Feeds/FeedCardList';
import {
  DatamartResource,
  AudienceSegmentMetricResource,
} from '../../../../models/datamart/DatamartResource';
import DatamartService from '../../../../services/DatamartService';
import { connect } from 'react-redux';

interface State {
  loading: boolean;

  dashboard: {
    report: AudienceReport;
    isLoading: boolean;
  };
  datamart?: DatamartResource;
}

interface MapStateToProps {
  audienceSegmentMetrics: { [key: string]: AudienceSegmentMetricResource[] };
}

export interface AudienceSegmentDashboardProps {
  segment?: AudienceSegmentResource;
  isLoading: boolean;
}

type Props = AudienceSegmentDashboardProps &
  InjectedIntlProps &
  MapStateToProps &
  InjectedNotificationProps &
  RouteComponentProps<EditAudienceSegmentParam>;

class AudienceSegmentDashboard extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      loading: true,
      dashboard: {
        isLoading: true,
        report: [],
      },
    };
  }

  componentDidMount() {
    const {
      match: {
        params: { segmentId, organisationId },
      },
      location: { search },
    } = this.props;

    if (segmentId) {
      const filters = parseSearch(search, SEGMENT_QUERY_SETTINGS);

      this.fetchDashboardView(
        organisationId,
        filters.from,
        filters.to,
        [
          {
            name: 'audience_segment_id',
            value: segmentId,
          },
        ],
        [],
      );
    }
  }

  componentWillReceiveProps(nextProps: Props) {
    const {
      match: {
        params: { segmentId },
      },
      location: { search },
    } = this.props;
    const {
      match: {
        params: {
          segmentId: nextSegmentId,
          organisationId: nextOrganisationId,
        },
      },
      location: { search: nextSearch },
      segment: nextSegment,
      audienceSegmentMetrics: nextAudienceSegmentMetrics,
    } = nextProps;

    if (
      (!compareSearches(search, nextSearch) ||
        segmentId !== nextSegmentId ||
        nextAudienceSegmentMetrics) &&
      nextSegment
    ) {
      DatamartService.getDatamart(nextSegment.datamart_id)
        .then(res => {
          this.setState({
            datamart: res.data,
          });
          return res.data;
        })
        .then(datamart => {
          const nextFilters = parseSearch(nextSearch, SEGMENT_QUERY_SETTINGS);
          const metrics: string[] = ['user_points'];
          let additionalMetrics;
          if (nextAudienceSegmentMetrics[datamart.id]) {
            additionalMetrics = nextAudienceSegmentMetrics[datamart.id].map(
              metric => metric.technical_name,
            );
            metrics.concat(additionalMetrics);
          } else if (datamart.storage_model_version === 'v201506') {
            additionalMetrics = [
              'user_accounts',
              'desktop_cookie_ids',
              'emails',
            ];
          }
          this.fetchDashboardView(
            nextOrganisationId,
            nextFilters.from,
            nextFilters.to,
            [
              {
                name: 'audience_segment_id',
                value: nextSegmentId,
              },
            ],
            additionalMetrics ? metrics.concat(additionalMetrics) : metrics,
          );
        });
    }
  }

  fetchDashboardView = (
    organisationId: string,
    from: McsMoment,
    to: McsMoment,
    filters: Filter[],
    metrics: string[],
  ) => {
    this.setState({ dashboard: { ...this.state.dashboard, isLoading: true } });

    return ReportService.getAudienceSegmentReport(
      organisationId,
      from,
      to,
      ['day'],
      metrics,
      filters,
    ).then(res =>
      this.setState({
        dashboard: {
          isLoading: false,
          report: normalizeReportView(res.data.report_view),
        },
      }),
    );
  };

  buildItems = () => {
    const { intl, segment, audienceSegmentMetrics } = this.props;
    const { dashboard, datamart } = this.state;
    const items = [
      {
        title: intl.formatMessage(messages.overview),
        display: (
          <Overview
            isFetching={dashboard.isLoading}
            dataSource={dashboard.report}
          />
        ),
      },
    ];
    if (datamart) {
      const metrics = audienceSegmentMetrics[datamart.id]
        ? audienceSegmentMetrics[datamart.id].map(el => el.technical_name)
        : [];
      if (
        metrics.includes('user_point_additions') ||
        metrics.includes('user_point_deletions') ||
        datamart.storage_model_version === 'v201506'
      ) {
        items.push({
          title: intl.formatMessage(messages.additionDeletion),
          display: (
            <AdditionDeletion
              isFetching={dashboard.isLoading}
              dataSource={dashboard.report}
            />
          ),
        });
      }
    }
    if (segment) {
      items.push({
        title: intl.formatMessage(messages.overlap),
        display: <Overlap datamartId={segment.datamart_id} />,
      });
      if (segment.type === 'USER_LIST') {
        items.push({
          title: intl.formatMessage(messages.imports),
          display: <UserListImportCard datamartId={segment.datamart_id} />,
        });
      }
    }
    return items;
  };

  render() {
    const { audienceSegmentMetrics } = this.props;
    const { datamart } = this.state;
    const datamartMetrics = datamart ? audienceSegmentMetrics[datamart.id] : [];
    return (
      <div>
        <AudienceCounters
          datamart={datamart}
          audienceSegmentMetrics={datamartMetrics}
        />
        <Card>
          <McsTabs items={this.buildItems()} />
        </Card>
        <FeedCardList />
      </div>
    );
  }
}

const mapStateToProps = (state: any) => ({
  audienceSegmentMetrics: state.metrics.audienceSegmentMetrics,
});

export default compose<Props, AudienceSegmentDashboardProps>(
  injectIntl,
  withRouter,
  injectNotifications,
  connect(
    mapStateToProps,
    undefined,
  ),
)(AudienceSegmentDashboard);

const messages = defineMessages({
  overview: {
    id: 'audience-segment-dashboard-tab-title-overview',
    defaultMessage: 'Overview',
  },
  additionDeletion: {
    id: 'audience-segment-dashboard-tab-title-addition-deletion',
    defaultMessage: 'Addition Deletion',
  },
  overlap: {
    id: 'audience-segment-dashboard-tab-title-overlap',
    defaultMessage: 'Overlap',
  },
  imports: {
    id: 'audience-segment-dashboard-tab-title-user-list-imports',
    defaultMessage: 'Imports Status',
  },
});
