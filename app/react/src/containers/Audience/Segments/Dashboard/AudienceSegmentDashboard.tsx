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
import { parseSearch, compareSearches } from '../../../../utils/LocationSearchHelper';
import { SEGMENT_QUERY_SETTINGS, AudienceReport } from './constants';

interface State {
  loading: boolean;
  counter: {
    report: AudienceReport,
    isLoading: boolean
  },
  dashboard: {
    report: AudienceReport,
    isLoading: boolean
  }
}

export interface AudienceSegmentDashboardProps {
  segment: AudienceSegmentResource | null;
  isLoading: boolean;
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
      counter: {
        isLoading: true,
        report: []
      },
      dashboard: {
        isLoading: true,
        report: []
      }
    };
  }

  componentDidMount() {

    const { match: { params: { segmentId, organisationId } }, location: { search }, } = this.props;

    if (segmentId) {
      const filters = parseSearch(search, SEGMENT_QUERY_SETTINGS);
      this.fetchCounterView(organisationId, [{
        name: 'audience_segment_id',
        value: segmentId
      }])
      this.fetchDashboardView(organisationId,
        filters.from,
        filters.to,
        [{
          name: 'audience_segment_id',
          value: segmentId
        }]
      )
    }
  }


  componentWillReceiveProps(nextProps: Props) {

    const { match: { params: { segmentId } }, location: { search }, } = this.props;
    const { match: { params: { segmentId: nextSegmentId, organisationId: nextOrganisationId } }, location: { search: nextSearch }, } = nextProps;

    if (!compareSearches(search, nextSearch) || segmentId !== nextSegmentId) {
      const nextFilters = parseSearch(nextSearch, SEGMENT_QUERY_SETTINGS);
      this.fetchCounterView(nextOrganisationId, [{
        name: 'audience_segment_id',
        value: nextSegmentId
      }])
      this.fetchDashboardView(nextOrganisationId,
        nextFilters.from,
        nextFilters.to,
        [{
          name: 'audience_segment_id',
          value: nextSegmentId
        }]
      )
    }
  }

  fetchCounterView = (organisationId: string, filters: Filter[]) => {
    return ReportService.getAudienceSegmentReport(
      organisationId,
      new McsMoment('now'),
      new McsMoment('now'),
      ['day'],
      ['user_points', 'user_accounts', 'emails', 'desktop_cookie_ids'],
      filters,
    ).then(res => this.setState({ counter: { isLoading: false, report: normalizeReportView(res.data.report_view) } }))

  }

  fetchDashboardView = (organisationId: string, from: McsMoment, to: McsMoment, filters: Filter[]) => {
    return ReportService.getAudienceSegmentReport(
      organisationId,
      from,
      to,
      ['day'],
      ['user_points', 'user_accounts', 'emails', 'desktop_cookie_ids', 'user_point_additions', 'user_point_deletions'],
      filters,
    ).then(res => this.setState({ dashboard: { isLoading: false, report: normalizeReportView(res.data.report_view) } }))

  }


  render() {

    const { intl, segment } = this.props;
    const { counter, dashboard } = this.state

    const getLoadingValue = (
      key: 'user_points' | 'user_accounts' | 'emails' | 'desktop_cookie_ids',
    ) => {

      const value = !counter.isLoading && counter.report && counter.report[0] ? counter.report[0][key] : undefined
      return {
        value,
        loading: counter.isLoading,
      };
    };
    const items = [
      {
        title: intl.formatMessage(messages.overview),
        display: <Overview isFetching={dashboard.isLoading} dataSource={dashboard.report} />,
      },
      {
        title: intl.formatMessage(messages.additionDeletion),
        display: <AdditionDeletion isFetching={dashboard.isLoading} dataSource={dashboard.report} />,
      },
      {
        title: intl.formatMessage(messages.overlap),
        display: <Overlap />,
      },
    ];
    if (segment) {
      if (segment.type === 'USER_LIST') {
        items.push({
          title: intl.formatMessage(messages.imports),
          display: (
            <UserListImportCard
              datamartId={segment.datamart_id}
            />
          ),
        });
      }
    }

    return (
      <div>
        <AudienceCounters
          userPoints={getLoadingValue('user_points')}
          userAccounts={getLoadingValue('user_accounts')}
          userAgents={getLoadingValue('desktop_cookie_ids')}
          userEmails={getLoadingValue('emails')}
        />
        <Card>
          <McsTabs items={items} />
        </Card>
      </div>
    );
  }
}

export default compose<Props, AudienceSegmentDashboardProps>(
  injectIntl,
  withRouter,
  injectNotifications,
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
