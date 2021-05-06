import * as React from 'react';
import { compose } from 'recompose';
import { Link, withRouter } from 'react-router-dom';
import { DownOutlined } from '@ant-design/icons';
import { Tooltip, message } from 'antd';
import { FormattedMessage, InjectedIntlProps, injectIntl, defineMessages } from 'react-intl';
import { TableViewFilters } from '../../../../components/TableView/index';
import { DISPLAY_SEARCH_SETTINGS } from './constants';
import { parseSearch, updateSearch } from '../../../../utils/LocationSearchHelper';
import { formatMetric } from '../../../../utils/MetricHelper';
import { campaignStatuses } from '../../constants';
import { messages } from '../messages';
import { CampaignStatus } from '../../../../models/campaign/constants/index';
import { RouteComponentProps } from 'react-router';
import {
  DisplayCampaignResource,
  DisplayCampaignResourceWithStats,
} from '../../../../models/campaign/display/DisplayCampaignResource';
import { Label } from '../../../Labels/Labels';
import { MapDispatchToProps } from './DisplayCampaignsPage';
import { EmptyTableView, McsIcon } from '@mediarithmics-private/mcs-components-library';
import { McsDateRangeValue } from '@mediarithmics-private/mcs-components-library/lib/components/mcs-date-range-picker/McsDateRangePicker';
import {
  ActionsColumnDefinition,
  DataColumnDefinition,
  ExtendedTableRowSelection,
} from '@mediarithmics-private/mcs-components-library/lib/components/table-view/table-view/TableView';

const messagesMap: {
  [key: string]: FormattedMessage.MessageDescriptor;
} = defineMessages({
  PENDING: {
    id: 'display.campaigns.list.status.new',
    defaultMessage: 'New',
  },
  ACTIVE: {
    id: 'display.campaigns.list.status.active',
    defaultMessage: 'Active',
  },
  PAUSED: {
    id: 'display.campaigns.list.status.paused',
    defaultMessage: 'Paused',
  },
  ARCHIVED: {
    id: 'display.campaigns.list.status.archived',
    defaultMessage: 'Archived',
  },
  noCampaign: {
    id: 'display.campaigns.noCampaign',
    defaultMessage: 'No campaign',
  },
});

interface DisplayCampaignsTableProps extends MapDispatchToProps {
  dataSource: DisplayCampaignResourceWithStats[];
  archiveCampaign: (campaign: DisplayCampaignResource) => void;
  rowSelection: ExtendedTableRowSelection;
  hasCampaigns: boolean;
  isFetchingCampaigns: boolean;
  isFetchingStats: boolean;
  totalCampaigns: number;
  isUpdatingStatuses: boolean;
}

type JoinedProps = DisplayCampaignsTableProps &
  InjectedIntlProps &
  RouteComponentProps<{ organisationId: string }>;

class DisplayCampaignsTable extends React.Component<JoinedProps> {
  editCampaign = (campaign: DisplayCampaignResource) => {
    const {
      match: {
        params: { organisationId },
      },
      location,
      history,
      intl,
    } = this.props;

    if (campaign.model_version === 'V2014_06') {
      message.info(intl.formatMessage(messages.editionNotAllowed));
    } else {
      const editUrl = `/v2/o/${organisationId}/campaigns/display/${campaign.id}/edit`;

      history.push({
        pathname: editUrl,
        state: { from: `${location.pathname}${location.search}` },
      });
    }
  };

  duplicateCampaign = (campaign: DisplayCampaignResource) => {
    const {
      match: {
        params: { organisationId },
      },
      history,
      intl,
    } = this.props;

    const editUrl = `/v2/o/${organisationId}/campaigns/display/create`;
    if (campaign.model_version === 'V2014_06') {
      message.info(intl.formatMessage(messages.editionNotAllowed));
    } else {
      history.push({ pathname: editUrl, state: { campaignId: campaign.id } });
    }
  };

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
      match: {
        params: { organisationId },
      },
      archiveCampaign,
      location: { search },
      hasCampaigns,
      isFetchingCampaigns,
      isFetchingStats,
      dataSource,
      totalCampaigns,
      labels,
      rowSelection,
      isUpdatingStatuses,
      intl: { formatMessage },
    } = this.props;

    const filter = parseSearch(search, DISPLAY_SEARCH_SETTINGS);

    const searchOptions = {
      placeholder: formatMessage(messages.searchDisplayCampaign),
      onSearch: (value: string) =>
        this.updateLocationSearch({
          keywords: value,
          currentPage: 1,
        }),
      defaultValue: filter.keywords,
    };

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

    const columnsVisibilityOptions = {
      isEnabled: true,
    };

    const pagination = {
      current: filter.currentPage,
      pageSize: filter.pageSize,
      total: totalCampaigns,
      onChange: (page: number, size: number) => {
        this.updateLocationSearch({
          currentPage: page,
          pageSize: size,
        });
        if (rowSelection && rowSelection.unselectAllItemIds && rowSelection.allRowsAreSelected) {
          rowSelection.unselectAllItemIds();
        }
      },
      onShowSizeChange: (current: number, size: number) =>
        this.updateLocationSearch({
          currentPage: 1,
          pageSize: size,
        }),
    };

    const renderMetricData = (value: any, numeralFormat: string, currency = '') => {
      if (isFetchingStats) {
        return <i className='mcs-table-cell-loading' />;
      }
      switch (currency) {
        case 'EUR': {
          const unlocalizedMoneyPrefix = '€ ';
          return formatMetric(value, numeralFormat, unlocalizedMoneyPrefix);
        }
        default: {
          const unlocalizedMoneyPrefix = '';
          return formatMetric(value, numeralFormat, unlocalizedMoneyPrefix);
        }
      }
    };

    const dataColumns: Array<DataColumnDefinition<DisplayCampaignResource>> = [
      {
        title: formatMessage(messages.status),
        key: 'status',
        isHideable: false,
        render: (text: string) => (
          <Tooltip placement='top' title={formatMessage(messagesMap[text])}>
            <span className={`mcs-campaigns-status-${text.toLowerCase()}`}>
              <McsIcon type='status' />
            </span>
          </Tooltip>
        ),
      },
      {
        title: formatMessage(messages.name),
        key: 'name',
        isHideable: false,
        render: (text: string, record: DisplayCampaignResource) => (
          <Link
            className='mcs-campaigns-link'
            to={`/v2/o/${organisationId}/campaigns/display/${record.id}`}
          >
            {text}
          </Link>
        ),
      },
      {
        title: formatMessage(messages.impressions),
        key: 'impressions',
        isVisibleByDefault: true,
        isHideable: true,
        render: (text: any) => renderMetricData(text, '0,0'),
      },
      {
        title: formatMessage(messages.clicks),
        key: 'clicks',
        isVisibleByDefault: true,
        isHideable: true,
        render: (text: any) => renderMetricData(text, '0,0'),
      },
      {
        title: formatMessage(messages.impressionCost),
        key: 'impressions_cost',
        isVisibleByDefault: true,
        isHideable: true,
        render: (text: any) => {
          // TODO find campaign currency (with getDisplayCampaignsById(record['campaign_id']))
          const campaignCurrency = 'EUR';
          return renderMetricData(text, '0,0.00', campaignCurrency);
        },
      },
      {
        title: formatMessage(messages.cpm),
        key: 'cpm',
        isVisibleByDefault: true,
        isHideable: true,
        render: (text: any) => renderMetricData(text, '0,0.00', 'EUR'),
      },
      {
        title: formatMessage(messages.ctr),
        key: 'ctr',
        isVisibleByDefault: true,
        isHideable: true,
        render: (text: any) => renderMetricData(parseFloat(text) / 100, '0.000%'),
      },
      {
        title: formatMessage(messages.cpc),
        key: 'cpc',
        isVisibleByDefault: true,
        isHideable: true,
        render: (text: any) => renderMetricData(text, '0,0.00', 'EUR'),
      },
      // TODO UNCOMMENT WHEN THE CPA IS FIXED ON BACKEND SIDE
      // {
      //   intlMessage: messages.cpa,
      //   key: 'cpa',
      //   isVisibleByDefault: true,
      //   isHideable: true,
      //   render: text => renderMetricData(text, '0,0.00', 'EUR'),
      // },
    ];

    const actionColumns: Array<ActionsColumnDefinition<DisplayCampaignResource>> = [
      {
        key: 'action',
        actions: () => [
          {
            message: formatMessage(messages.editDisplayCampaign),
            callback: this.editCampaign,
          },
          {
            message: formatMessage(messages.duplication),
            callback: this.duplicateCampaign,
          },
          {
            message: formatMessage(messages.archiveDisplayCampaign),
            callback: archiveCampaign,
          },
        ],
      },
    ];

    const statusItems = campaignStatuses.map(status => ({
      key: status,
      value: status,
    }));

    const filtersOptions = [
      {
        displayElement: (
          <div>
            <FormattedMessage id='display.campaigns.list.filterStatus' defaultMessage='Status' />{' '}
            <DownOutlined />
          </div>
        ),
        selectedItems: filter.statuses.map((status: CampaignStatus) => ({
          key: status,
          value: status,
        })),
        items: statusItems,
        getKey: (item: { key: CampaignStatus; value: CampaignStatus }) => item.key,
        display: (item: { key: CampaignStatus; value: CampaignStatus }) => item.value,
        handleMenuClick: (values: Array<{ key: CampaignStatus; value: CampaignStatus }>) =>
          this.updateLocationSearch({
            statuses: values.map(v => v.value),
          }),
      },
    ];

    const labelsOptions = {
      labels: this.props.labels,
      selectedLabels: labels.filter(label => {
        return filter.label_id.find((filteredLabelId: any) => filteredLabelId === label.id)
          ? true
          : false;
      }),
      onChange: (newLabels: Label[]) => {
        const formattedLabels = newLabels.map(label => label.id);
        this.updateLocationSearch({ label_id: formattedLabels });
      },
      buttonMessage: messages.filterByLabel,
    };

    return hasCampaigns ? (
      <div className='mcs-table-container'>
        <TableViewFilters
          columns={dataColumns}
          actionsColumnsDefinition={actionColumns}
          searchOptions={searchOptions}
          dateRangePickerOptions={dateRangePickerOptions}
          filtersOptions={filtersOptions}
          columnsVisibilityOptions={columnsVisibilityOptions}
          dataSource={dataSource}
          loading={isFetchingCampaigns || isUpdatingStatuses}
          pagination={pagination}
          labelsOptions={labelsOptions}
          rowSelection={rowSelection}
        />
      </div>
    ) : (
      <EmptyTableView iconType='display' message={formatMessage(messagesMap.noCampaign)} />
    );
  }
}

export default compose<JoinedProps, DisplayCampaignsTableProps>(
  withRouter,
  injectIntl,
)(DisplayCampaignsTable);
