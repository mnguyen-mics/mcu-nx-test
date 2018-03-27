import * as React from 'react';
import { compose } from 'recompose';
import {
  TableViewFilters,
  EmptyTableView,
} from '../../../../../components/TableView';
// import { Filter } from '../../Common/domain';
import {
  parseSearch,
  updateSearch,
} from '../../../../../utils/LocationSearchHelper';

import { InjectedIntlProps, injectIntl, defineMessages } from 'react-intl';
import { RouteComponentProps, withRouter } from 'react-router';
import { McsDateRangeValue } from '../../../../../components/McsDateRangePicker';
import { DISPLAY_SEARCH_SETTINGS } from './ServiceUsageReportListPage';

const messages = defineMessages({
  providerName: {
    id: 'setrtings.datamart.seriveUsageReport.table.column.providerName',
    defaultMessage: 'Provider Name',
  },
  campaignName: {
    id: 'setrtings.datamart.seriveUsageReport.table.column.campaignName',
    defaultMessage: 'Campaign Name',
  },
  serviceName: {
    id: 'setrtings.datamart.seriveUsageReport.table.column.serviceName',
    defaultMessage: 'Service Name',
  },
  serviceElementName: {
    id: 'setrtings.datamart.seriveUsageReport.table.column.serviceElementName',
    defaultMessage: 'Serivce Element Name',
  },
  usage: {
    id: 'setrtings.datamart.seriveUsageReport.table.column.usage',
    defaultMessage: 'Usage',
  },
  noData: {
    id: 'setrtings.datamart.seriveUsageReport.empty.table',
    defaultMessage: 'No data',
  },
});

interface ServiceUsageReportTableProps {
  dataSource: any[];
  isLoading: boolean;
}

interface State {}

type Props = ServiceUsageReportTableProps &
  InjectedIntlProps &
  RouteComponentProps<{ organisationId: string }>;

class ServiceUsageReportTable extends React.Component<Props, State> {
  updateLocationSearch = (params: any) => {
    const {
      history,
      location: { search: currentSearch, pathname },
    } = this.props;

    const nextLocation = {
      pathname,
      search: updateSearch(currentSearch, params, DISPLAY_SEARCH_SETTINGS),
    };
    history.push(nextLocation);
  };

  render() {
    const { dataSource, location: { search } } = this.props;
    const filter = parseSearch(search, DISPLAY_SEARCH_SETTINGS);
    const pagination = {
      current: filter.currentPage,
      pageSize: filter.pageSize,
      total: dataSource.length,
      onChange: (page: number, size: number) =>
        this.updateLocationSearch({
          currentPage: page,
          pageSize: size,
        }),
      onShowSizeChange: (current: number, size: number) =>
        this.updateLocationSearch({
          pageSize: size,
          currentPage: 1,
        }),
    };

    const dataColumns = [
      {
        intlMessage: messages.providerName,
        key: 'provider_name',
        isHideable: false,
      },
      {
        intlMessage: messages.campaignName,
        key: 'campaign_name',
        isHideable: false,
      },
      {
        intlMessage: messages.serviceName,
        key: 'serivce_name',
        isHideable: false,
      },
      {
        intlMessage: messages.serviceElementName,
        key: 'service_element_name',
        isHideable: false,
      },
      {
        intlMessage: messages.usage,
        key: 'usage',
        isHideable: false,
      },
    ];

    const dateRangePickerOptions = {
      isEnabled: true,
      onChange: (values: McsDateRangeValue) =>
        this.updateLocationSearch({
          from: values.from,
          to: values.to,
        }),
      values: {
        from: filter.from,
        to: filter.to,
      },
    };

    return dataSource.length ? (
      <TableViewFilters
        columns={dataColumns}
        dataSource={dataSource}
        dateRangePickerOptions={dateRangePickerOptions}
        loading={this.props.isLoading}
        pagination={pagination}
      />
    ) : (
      <EmptyTableView iconType="full-users" intlMessage={messages.noData} />
    );
  }
}

export default compose<Props, ServiceUsageReportTableProps>(
  injectIntl,
  withRouter,
)(ServiceUsageReportTable);
