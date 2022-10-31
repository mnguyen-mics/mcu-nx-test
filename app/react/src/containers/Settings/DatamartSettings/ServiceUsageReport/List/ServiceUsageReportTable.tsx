import * as React from 'react';
import { Layout } from 'antd';
import { compose } from 'recompose';
import {
  updateSearch,
  parseSearch,
  PAGINATION_SEARCH_SETTINGS,
} from '../../../../../utils/LocationSearchHelper';
import { InjectedIntlProps, injectIntl, defineMessages } from 'react-intl';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { DISPLAY_SEARCH_SETTINGS } from './ServiceUsageReportListPage';
import ItemList from '../../../../../components/ItemList';
import { McsIconType } from '@mediarithmics-private/mcs-components-library/lib/components/mcs-icon';
import {
  McsDateRangeValue,
  McsDateRangePickerMessages,
} from '@mediarithmics-private/mcs-components-library/lib/components/mcs-date-range-picker/McsDateRangePicker';
import {
  convertMessageDescriptorToString,
  mcsDateRangePickerMessages,
} from '../../../../../IntlMessages';

const { Content } = Layout;

export const messages = defineMessages({
  providerName: {
    id: 'settings.datamart.seriveUsageReport.table.column.providerName',
    defaultMessage: 'Provider Name',
  },
  campaignId: {
    id: 'settings.datamart.seriveUsageReport.table.column.campaignId',
    defaultMessage: 'Campaign Id',
  },
  campaignName: {
    id: 'settings.datamart.seriveUsageReport.table.column.campaignName',
    defaultMessage: 'Campaign Name',
  },
  subCampaignId: {
    id: 'settings.datamart.seriveUsageReport.table.column.subCampaignId',
    defaultMessage: 'Sub Campaign Id',
  },
  subCampaignName: {
    id: 'settings.datamart.seriveUsageReport.table.column.subCampaignName',
    defaultMessage: 'Sub Campaign Name',
  },
  serviceName: {
    id: 'settings.datamart.seriveUsageReport.table.column.serviceName',
    defaultMessage: 'Service Name',
  },
  serviceElementName: {
    id: 'settings.datamart.seriveUsageReport.table.column.serviceElementName',
    defaultMessage: 'Serivce Element Name',
  },
  usage: {
    id: 'settings.datamart.seriveUsageReport.table.column.usage',
    defaultMessage: 'Usage',
  },
  noData: {
    id: 'settings.datamart.seriveUsageReport.empty.table',
    defaultMessage: 'No data',
  },
});

interface ServiceUsageReportTableProps {
  dataSource: any[];
  loading: boolean;
  fetchList: () => void;
  total: number;
  additionnalComponent?: React.ReactNode;
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
    const {
      dataSource,
      additionnalComponent,
      location: { search },
    } = this.props;

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
        intlMessage: messages.subCampaignId,
        key: 'sub_campaign_id',
        isHideable: false,
      },
      {
        intlMessage: messages.serviceName,
        key: 'service_name',
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

    const emptyTable: {
      iconType: McsIconType;
      message: string;
    } = {
      iconType: 'library',
      message: this.props.intl.formatMessage(messages.noData),
    };

    const filter = parseSearch(search, DISPLAY_SEARCH_SETTINGS);
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
      messages: convertMessageDescriptorToString(
        mcsDateRangePickerMessages,
        this.props.intl,
      ) as McsDateRangePickerMessages,
    };

    return (
      <div className='ant-layout'>
        <Content className='mcs-content-container'>
          <ItemList
            fetchList={this.props.fetchList}
            dataSource={dataSource}
            loading={this.props.loading}
            total={this.props.total}
            columns={dataColumns}
            pageSettings={PAGINATION_SEARCH_SETTINGS}
            emptyTable={emptyTable}
            additionnalComponent={additionnalComponent}
            dateRangePickerOptions={dateRangePickerOptions}
          />
        </Content>
      </div>
    );
  }
}

export default compose<Props, ServiceUsageReportTableProps>(
  injectIntl,
  withRouter,
)(ServiceUsageReportTable);
