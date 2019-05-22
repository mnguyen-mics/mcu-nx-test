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
import { DatamartWithMetricResource } from '../../../../models/datamart/DatamartResource';

interface State {
  loading: boolean;
  dashboard: {
    reports: AudienceReport;
    isLoading: boolean;
  };
}
export interface AudienceSegmentDashboardProps {
  segment?: AudienceSegmentResource;
  isLoading: boolean;
  datamarts: DatamartWithMetricResource[];
}

type Props = AudienceSegmentDashboardProps &
  InjectedIntlProps &
  InjectedNotificationProps &
  RouteComponentProps<EditAudienceSegmentParam>;

class AudienceSegmentDashboard extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      loading: true,
      dashboard: {
        isLoading: true,
        reports: [],
      },
  
    };
  }


  componentWillReceiveProps(nextProps: Props) {
    const {
      match: {
        params: { segmentId },
      },
      location: { search },
      datamarts
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
    } = nextProps;



    if (
      (!compareSearches(search, nextSearch) ||
        segmentId !== nextSegmentId ||
        datamarts) &&
      nextSegment
    ) {
      const nextFilters = parseSearch(nextSearch, SEGMENT_QUERY_SETTINGS);
      const metrics: string[] = [
        'user_points',
        'user_point_additions',
        'user_point_deletions',
      ];
      let additionalMetrics;
      
      if (datamarts) {
        const datamart = datamarts.find(
          dm => dm.datamart_resource.id === nextSegment.datamart_id,
        );

        additionalMetrics =
          datamart && datamart.audience_segment_metrics
            ? datamart.audience_segment_metrics
                .filter(metric => metric.status === 'LIVE')
                .map(el => el.technical_name)
            : undefined;
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
          reports: normalizeReportView(res.data.report_view),
        },
      }),
    );
  };

  buildItems = () => {
    const { intl, segment } = this.props;
    const { dashboard } = this.state;
    const items = [
      {
        title: intl.formatMessage(messages.overview),
        display: (
          <Overview
            isFetching={dashboard.isLoading}
            dataSource={dashboard.reports}
          />
        ),
      },
      {
        title: intl.formatMessage(messages.additionDeletion),
        display: (
          <AdditionDeletion
            isFetching={dashboard.isLoading}
            dataSource={dashboard.reports}
          />
        ),
      },
    ];
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
    const { segment, datamarts } = this.props;
    return (
      <div>
        <AudienceCounters
          datamarts={datamarts}
          datamartId={segment ? segment.datamart_id : undefined}
        />
        <Card>
          <McsTabs items={this.buildItems()} />
        </Card>
        <FeedCardList />
      </div>
    );
  }
}

export default compose<Props, AudienceSegmentDashboardProps>(
  injectIntl,
  withRouter,
  injectNotifications
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
