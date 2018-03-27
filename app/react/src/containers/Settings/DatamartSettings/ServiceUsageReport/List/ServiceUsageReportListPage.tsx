import * as React from 'react';
import { Row, Button } from 'antd';
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
} from '../../../../../utils/LocationSearchHelper';
import ServiceUsageReportTable from './ServiceUsageReportTable';
import ServiceUsageReportService from '../../../../../services/ServiceUsageReportService';

import { McsIcon } from '../../../../../components';
const messages = defineMessages({
  serviceUsageReportTitle: {
    id: 'seetings.service.usage.report.title',
    defaultMessage: 'Service Usage Report List',
  },
});

export const DISPLAY_SEARCH_SETTINGS = [
  ...PAGINATION_SEARCH_SETTINGS,
  ...FILTERS_SEARCH_SETTINGS,
  ...DATE_SEARCH_SETTINGS,
  ...LABELS_SEARCH_SETTINGS,
];

interface ServiceUsageReportListPageProps {}

interface State {
  isLoading: boolean;
  dataSource: any[]; // type better
  exportIsRunning: boolean;
}

type Props = ServiceUsageReportListPageProps;

class ServiceUsageReportListPage extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      isLoading: true,
      dataSource: [],
      exportIsRunning: false,
    };
  }

  componentDidMount() {
    const {
      match: { params: { organisationId } },
      location: { search },
    } = this.props;
    const filter = parseSearch(search, DISPLAY_SEARCH_SETTINGS);
    const dimensions = [
      'campaign_id',
      'campaign_name',
      'provider_name',
      'service_id',
      'service_name',
      'service_element_id',
      'service_element_name',
    ];
    ServiceUsageReportService.getServiceUsageProviders(
      organisationId,
      filter.from,
      filter.to,
      dimensions,
    ).then(results => {
      this.setState(
        {
          dataSource: results.data.report_view.rows.map(row => {
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
            isLoading: false,
          });
        },
      );
    });
  }

  handleRunExport = () => {
    this.setState({
      exportIsRunning: true,
    });
    setTimeout(() => {
      this.setState({
        exportIsRunning: false,
      });
    }, 2000);
  };

  render() {
    const { dataSource, isLoading, exportIsRunning } = this.state;
    return (
      <Row className="mcs-table-container">
        <div>
          <div className="mcs-card-header mcs-card-title">
            <span className="mcs-card-title">
              <FormattedMessage {...messages.serviceUsageReportTitle} />
            </span>
            <Button
              onClick={this.handleRunExport}
              loading={exportIsRunning}
              style={{ float: 'right' }}
            >
              {!exportIsRunning && <McsIcon type="download" />}
              <FormattedMessage id="EXPORT" />
            </Button>
          </div>
          <hr className="mcs-separator" />
          <ServiceUsageReportTable
            dataSource={dataSource}
            isLoading={isLoading}
          />
        </div>
      </Row>
    );
  }
}

export default compose<Props, ServiceUsageReportListPageProps>(
  injectIntl,
  withRouter,
)(ServiceUsageReportListPage);
