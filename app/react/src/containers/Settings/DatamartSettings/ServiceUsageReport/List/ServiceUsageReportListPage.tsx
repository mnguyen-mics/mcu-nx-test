import * as React from 'react';
import { Button } from 'antd';
import { compose } from 'recompose';
import { RouteComponentProps, withRouter } from 'react-router';
import {
  FormattedMessage,
  defineMessages,
  InjectedIntlProps,
  injectIntl,
} from 'react-intl';

import {
  parseSearch,
  PAGINATION_SEARCH_SETTINGS,
  FILTERS_SEARCH_SETTINGS,
  DATE_SEARCH_SETTINGS,
  LABELS_SEARCH_SETTINGS,
  KEYWORD_SEARCH_SETTINGS,
} from '../../../../../utils/LocationSearchHelper';
import ServiceUsageReportTable from './ServiceUsageReportTable';
import ServiceUsageReportService from '../../../../../services/ServiceUsageReportService';
import { McsIcon } from '../../../../../components';
import ExportService from '../../../../../services/ExportService';

const messages = defineMessages({
  serviceUsageReportTitle: {
    id: 'settings.datamart.serviceUsageReport.list.title',
    defaultMessage: 'Service Usage Report List',
  },
});

export const DISPLAY_SEARCH_SETTINGS = [
  ...PAGINATION_SEARCH_SETTINGS,
  ...FILTERS_SEARCH_SETTINGS,
  ...KEYWORD_SEARCH_SETTINGS,
  ...DATE_SEARCH_SETTINGS,
  ...LABELS_SEARCH_SETTINGS,
];

interface ServiceUsageReportListPageProps {}

interface State {
  loading: boolean;
  dataSource: any[]; // type better
  exportIsRunning: boolean;
  total: number;
}

type Props = ServiceUsageReportListPageProps &
  InjectedIntlProps &
  RouteComponentProps<{ organisationId: string }>;

class ServiceUsageReportListPage extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      loading: true,
      dataSource: [],
      exportIsRunning: false,
      total: 0,
    };
  }

  componentDidMount() {
    this.fetchAndStoreData();
  }

  fetchAndStoreData = () => {
    this.fetchData().then(resp => {
      this.setState(
        {
          dataSource: resp.data.report_view.rows.map(row => {
            return {
              provider_name: row[1],
              campaign_name: row[3],
              serivce_name: row[5],
              service_element_name: row[7],
              usage: row[8],
            };
          }),
        },
        () => {
          this.setState({
            loading: false,
            total: resp.data.report_view.total_items,
          });
        },
      );
    });
  };

  fetchData = () => {
    const {
      match: {
        params: { organisationId },
      },
      location: { search },
    } = this.props;
    const filter = parseSearch(search, DISPLAY_SEARCH_SETTINGS);
    const dimensions = [
      'provider_organisation_id',
      'provider_name',
      'campaign_id',
      'campaign_name',
      'service_id',
      'service_name',
      'service_element_id',
      'service_element_name',
      'segment_name',
    ];
    return ServiceUsageReportService.getServiceUsageProviders(
      organisationId,
      filter.from,
      filter.to,
      dimensions,
    );
  };

  handleRunExport = () => {
    const {
      match: {
        params: { organisationId },
      },
      location: { search },
      intl: { formatMessage },
    } = this.props;
    const filter = parseSearch(search, DISPLAY_SEARCH_SETTINGS);
    this.setState({
      exportIsRunning: true,
    });
    this.fetchData().then(resp => {
      Promise.resolve(
        resp.data.report_view.rows.map(row => {
          return {
            provider_organisation_id: row[0],
            provider_name: row[1],
            campaign_id: row[2],
            campaign_name: row[3],
            service_id: row[4],
            service_name: row[5],
            service_element_id: row[6],
            segment_name: row[7],
            unit_count: row[8],
          };
        }),
      ).then(data => {
        ExportService.exportServiceUsageReportList(
          organisationId,
          data,
          filter,
          formatMessage,
        );
        this.setState({
          exportIsRunning: false,
        });
      });
    });
  };

  additionnalComponentRenderer = () => {
    const { exportIsRunning } = this.state;
    return (
      <div>
        <span className="mcs-card-title">
          <FormattedMessage {...messages.serviceUsageReportTitle} />
        </span>
        <Button
          onClick={this.handleRunExport}
          loading={exportIsRunning}
          style={{ float: 'right', bottom: '10px' }}
        >
          {!exportIsRunning && <McsIcon type="download" />}
          <FormattedMessage id="settings.datamart.serviceUsageReport.list.export" defaultMessage="Export" />
        </Button>

        <hr className="mcs-separator" />
      </div>
    );
  };

  render() {
    const { dataSource, loading, total } = this.state;

    return (
      <ServiceUsageReportTable
        fetchList={this.fetchAndStoreData}
        dataSource={dataSource}
        loading={loading}
        total={total}
        additionnalComponent={this.additionnalComponentRenderer()}
      />
    );
  }
}

export default compose<Props, ServiceUsageReportListPageProps>(
  injectIntl,
  withRouter,
)(ServiceUsageReportListPage);
