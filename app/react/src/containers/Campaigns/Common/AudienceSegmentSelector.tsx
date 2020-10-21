import * as React from 'react';
import { injectIntl, InjectedIntlProps, defineMessages } from 'react-intl';
import { compose } from 'recompose';
import { withRouter, RouteComponentProps } from 'react-router';
import TableSelector, {
  TableSelectorProps,
} from '../../../components/ElementSelector/TableSelector';
import { SearchFilter } from '../../../components/ElementSelector';
import { DataColumnDefinition } from '../../../components/TableView/TableView';
import {
  GetSegmentsOption,
  IAudienceSegmentService,
} from '../../../services/AudienceSegmentService';
import { AudienceSegmentResource, AudienceSegmentShape } from '../../../models/audiencesegment';
import { formatMetric, normalizeReportView } from '../../../utils/MetricHelper';
import { getPaginatedApiParam } from '../../../utils/ApiHelper';
import { Index } from '../../../utils';
import { injectDatamart, InjectedDatamartProps } from '../../Datamart';
import { UserWorkspaceResource } from '../../../models/directory/UserProfileResource';
import ReportService from '../../../services/ReportService';
import McsMoment from '../../../utils/McsMoment';
import { normalizeArrayOfObject } from '../../../utils/Normalizer';
import { TYPES } from '../../../constants/types';
import { lazyInject } from '../../../config/inversify.config';
import { SegmentNameDisplay } from '../../Audience/Common/SegmentNameDisplay';

const SegmentTableSelector: React.ComponentClass<
  TableSelectorProps<AudienceSegmentShape>
> = TableSelector;

const messages = defineMessages({
  segmentSelectorTitle: {
    id: 'segment-selector-title',
    defaultMessage: 'Add an audience',
  },
  segmentSelectorSearchPlaceholder: {
    id: 'segment-selector-search-placeholder',
    defaultMessage: 'Search audience',
  },
  segmentSelectorColumnName: {
    id: 'segment-selector-column-name',
    defaultMessage: 'Name',
  },
  segmentSelectorColumnUserPoints: {
    id: 'segment-selector-column-userPoints',
    defaultMessage: 'User Points',
  },
  segmentSelectorColumnCookieIds: {
    id: 'segment-selector.column-cookieIds',
    defaultMessage: 'Desktop Cookie Ids',
  },
});

export interface AudienceSegmentSelectorProps {
  selectedSegmentIds: string[];
  save: (segments: AudienceSegmentResource[]) => void;
  close: () => void;
}

interface MapStateProps {
  defaultDatamart: (organisationId: string) => { id: string };
  workspace: (organisationId: string) => UserWorkspaceResource;
}
interface State {
  reportBySegmentId: Index<any>;
  fetchingReport: boolean;
}

type Props = AudienceSegmentSelectorProps &
  InjectedIntlProps &
  MapStateProps &
  InjectedDatamartProps &
  RouteComponentProps<{ organisationId: string }>;

class AudienceSegmentSelector extends React.Component<Props, State> {
  @lazyInject(TYPES.IAudienceSegmentService)
  private _audienceSegmentService: IAudienceSegmentService;
  constructor(props: Props) {
    super(props);
    this.state = {
      reportBySegmentId: {},
      fetchingReport: false,
    };
  }

  componentDidMount() {
    const {
      match: {
        params: { organisationId },
      },
    } = this.props;
    this.setState({ fetchingReport: true });
    ReportService.getAudienceSegmentReport(
      organisationId,
      new McsMoment('now'),
      new McsMoment('now'),
      ['audience_segment_id'],
      undefined,
    ).then(resp => {
      this.setState({
        fetchingReport: false,
        reportBySegmentId: normalizeArrayOfObject(
          normalizeReportView(resp.data.report_view),
          'audience_segment_id',
        ),
      });
    });
  }

  saveSegments = (
    segmentIds: string[],
    segments: AudienceSegmentResource[],
  ) => {
    this.props.save(segments);
  };

  fetchSegments = (filter: SearchFilter) => {
    const {
      match: {
        params: { organisationId },
      },
    } = this.props;

    const options: GetSegmentsOption = {
      ...getPaginatedApiParam(filter.currentPage, filter.pageSize),
      persisted: true,
    };

    if (filter.keywords) {
      options.keywords = filter.keywords;
    }

    if (filter.datamartId) {
      options.datamart_id = filter.datamartId;
    }

    return this._audienceSegmentService.getSegments(organisationId, options);
  };

  fetchSegment = (segmentId: string) => {
    return this._audienceSegmentService.getSegment(segmentId);
  };

  render() {
    const {
      selectedSegmentIds,
      close,
      intl: { formatMessage },
    } = this.props;

    const { fetchingReport, reportBySegmentId } = this.state;

    const getMetric = (segmentId: string, metricName: string) => {
      if (fetchingReport) {
        return <i className="mcs-table-cell-loading" />;
      }
      const report = reportBySegmentId[segmentId];
      const metric = report && report[metricName];
      return formatMetric(metric, '0,0');
    };

    const columns: Array<DataColumnDefinition<AudienceSegmentShape>> = [
      {
        intlMessage: messages.segmentSelectorColumnName,
        key: 'name',
        render: (text, record) => <SegmentNameDisplay audienceSegmentResource={record}/>,
      },
      {
        intlMessage: messages.segmentSelectorColumnUserPoints,
        key: 'user_points',
        render: (text, record) => getMetric(record.id, 'user_points'),
      },
      {
        intlMessage: messages.segmentSelectorColumnCookieIds,
        key: 'desktop_cookie_ids',
        render: (text, record) => getMetric(record.id, 'desktop_cookie_ids'),
      },
    ];

    return (
      <SegmentTableSelector
        actionBarTitle={formatMessage(messages.segmentSelectorTitle)}
        displayFiltering={true}
        searchPlaceholder={formatMessage(
          messages.segmentSelectorSearchPlaceholder,
        )}
        selectedIds={selectedSegmentIds}
        fetchDataList={this.fetchSegments}
        fetchData={this.fetchSegment}
        columnsDefinitions={columns}
        save={this.saveSegments}
        close={close}
        displayDatamartSelector={true}
      />
    );
  }
}

export default compose<Props, AudienceSegmentSelectorProps>(
  withRouter,
  injectIntl,
  injectDatamart,
)(AudienceSegmentSelector);
