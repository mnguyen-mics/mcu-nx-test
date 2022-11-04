import * as React from 'react';
import { Button } from 'antd';
import { compose } from 'recompose';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { FormattedMessage, defineMessages, InjectedIntlProps, injectIntl } from 'react-intl';

import {
  parseSearch,
  PAGINATION_SEARCH_SETTINGS,
  FILTERS_SEARCH_SETTINGS,
  DATE_SEARCH_SETTINGS,
  LABELS_SEARCH_SETTINGS,
  KEYWORD_SEARCH_SETTINGS,
} from '../../../../../utils/LocationSearchHelper';
import ServiceUsageReportTable from './ServiceUsageReportTable';
import ExportService from '../../../../../services/ExportService';
import { lazyInject } from '../../../../../config/inversify.config';
import { TYPES } from '../../../../../constants/types';
import { IServiceUsageReportService } from '../../../../../services/ServiceUsageReportService';
import { McsIcon } from '@mediarithmics-private/mcs-components-library';

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

interface State {
  loading: boolean;
  dataSource: any[]; // type better
  exportIsRunning: boolean;
  total: number;
}

type Props = InjectedIntlProps & RouteComponentProps<{ organisationId: string }>;

class ServiceUsageReportListPage extends React.Component<Props, State> {
  @lazyInject(TYPES.IServiceUsageReportService)
  private _serviceUsageReportService: IServiceUsageReportService;
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
              provider_organisation_id: row[0],
              provider_name: row[1],
              campaign_id: row[2],
              campaign_name: row[3],
              sub_campaign_id: row[4],
              service_name: row[6],
              service_element_id: row[8],
              service_element_name: row[9],
              usage: row[10],
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
      'sub_campaign_id',
      'sub_campaign_name',
      'service_id',
      'service_name',
      'service_element_id',
      'service_element_name',
      'segment_name',
    ];
    return this._serviceUsageReportService.getServiceUsageProviders(
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
            sub_campaign_id: row[4],
            sub_campaign_name: row[5],
            service_id: row[6],
            service_name: row[7],
            service_element_id: row[8],
            segment_name: row[9],
            unit_count: row[10],
          };
        }),
      ).then(data => {
        ExportService.exportServiceUsageReportList(organisationId, data, filter, formatMessage);
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
        <span className='mcs-card-title'>
          <FormattedMessage {...messages.serviceUsageReportTitle} />
        </span>
        <Button
          onClick={this.handleRunExport}
          loading={exportIsRunning}
          style={{ float: 'right', bottom: '10px' }}
        >
          {!exportIsRunning && <McsIcon type='download' />}
          <FormattedMessage
            id='settings.datamart.serviceUsageReport.list.export'
            defaultMessage='Export'
          />
        </Button>

        <hr className='mcs-separator' />
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

export default compose<Props, {}>(injectIntl, withRouter)(ServiceUsageReportListPage);
