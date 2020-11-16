import * as React from 'react';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';
import { Icon, Tooltip } from 'antd';
import { FormattedMessage, injectIntl, InjectedIntlProps } from 'react-intl';
import {
  TableViewFilters,
} from '../../../../components/TableView/index';
import messages from './messages';
import {
  EmailCampaignResourceWithStats,
  EmailCampaignResource,
} from '../../../../models/campaign/email/EmailCampaignResource';
import { formatMetric } from '../../../../utils/MetricHelper';
import { campaignStatuses } from '../../constants';
import { Index } from '../../../../utils';
import { LabelsSelectorProps } from '../../../../components/LabelsSelector';
import { parseSearch } from '../../../../utils/LocationSearchHelper';
import { EMAIL_SEARCH_SETTINGS } from './constants';
import { McsDateRangeValue } from '../../../../components/McsDateRangePicker';
import { compose } from 'recompose';
import { CampaignStatus } from '../../../../models/campaign/constants';
import { EmptyTableView, McsIcon } from '@mediarithmics-private/mcs-components-library';

interface EmailCampaignsTableProps {
  dataSource: EmailCampaignResourceWithStats[];
  archiveCampaign: (campaign: EmailCampaignResource) => void;
  totalCampaigns: number;
  hasEmailCampaigns: boolean;
  isFetchingCampaigns: boolean;
  isFetchingStats: boolean;
  filter: Index<any>;
  onFilterChange: (filter: Index<any>) => void;
  labelsOptions: LabelsSelectorProps;
}

type Props = EmailCampaignsTableProps &
  InjectedIntlProps &
  RouteComponentProps<{ organisationId: string }>;

class EmailCampaignsTable extends React.Component<Props> {
  handleEditCampaign = (campaign: EmailCampaignResource) => {
    const {
      match: {
        params: { organisationId },
      },
      history,
    } = this.props;
    history.push(`/v2/o/${organisationId}/campaigns/email/${campaign.id}/edit`);
  };

  render() {
    const {
      dataSource,
      archiveCampaign,
      isFetchingCampaigns,
      intl: { formatMessage },
      onFilterChange,
      location: { search },
      isFetchingStats,
      totalCampaigns,
      labelsOptions,
      hasEmailCampaigns,
    } = this.props;

    const filter = parseSearch(search, EMAIL_SEARCH_SETTINGS);

    const searchOptions = {
      placeholder: formatMessage(messages.searchPlaceholder),
      onSearch: (value: string) =>
        onFilterChange({
          keywords: value,
        }),
      defaultValue: filter.keywords,
    };

    const dateRangePickerOptions = {
      isEnabled: true,
      onChange: (values: McsDateRangeValue) =>
        onFilterChange({
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
      onChange: (page: number) =>
        onFilterChange({
          currentPage: page,
        }),
      onShowSizeChange: (current: number, size: number) =>
        onFilterChange({
          pageSize: size,
          currentPage: 1,
        }),
    };

    const renderMetricData = (
      value: any,
      numeralFormat: string,
      currency = '',
    ) => {
      if (isFetchingStats) {
        return <i className="mcs-table-cell-loading" />; // (<span>loading...</span>);
      }
      const unlocalizedMoneyPrefix = currency === 'EUR' ? '€ ' : '';
      return formatMetric(value, numeralFormat, unlocalizedMoneyPrefix);
    };

    const dataColumns = [
      {
        intlMessage: messages.emailHeaderStatus,
        key: 'status',
        isHideable: false,
        render: (text: string) => (
          <Tooltip placement="top" title={formatMessage(messages[text])}>
            <span className={`mcs-campaigns-status-${text.toLowerCase()}`}>
              <McsIcon type="status" />
            </span>
          </Tooltip>
        ),
      },
      {
        intlMessage: messages.emailHeaderName,
        key: 'name',
        isHideable: false,
        render: (text: string, record: EmailCampaignResource) => (
          <Link
            className="mcs-campaigns-link"
            to={`/v2/o/${record.organisation_id}/campaigns/email/${record.id}`}
          >
            {text}
          </Link>
        ),
      },
      {
        intlMessage: messages.emailHeaderSent,
        key: 'email_sent',
        isVisibleByDefault: true,
        isHideable: true,
        render: (text: string) => renderMetricData(text, '0,0'),
      },
      {
        intlMessage: messages.emailHeaderHardBounced,
        key: 'email_hard_bounced',
        isVisibleByDefault: true,
        isHideable: true,
        render: (text: string) => renderMetricData(text, '0,0'),
      },
      {
        intlMessage: messages.emailHeaderSoftBounced,
        key: 'email_soft_bounced',
        isVisibleByDefault: true,
        isHideable: true,
        render: (text: string) => renderMetricData(text, '0,0'),
      },
      {
        intlMessage: messages.emailHeaderClicks,
        key: 'clicks',
        isVisibleByDefault: true,
        isHideable: true,
        render: (text: string) => renderMetricData(text, '0,0'),
      },
      {
        intlMessage: messages.emailHeaderImpressions,
        key: 'impressions',
        isVisibleByDefault: true,
        isHideable: true,
        render: (text: string) => renderMetricData(text, '0,0'),
      },
    ];

    const actionColumns = [
      {
        key: 'action',
        actions: () => [
          {
            intlMessage: messages.editCampaign,
            callback: this.handleEditCampaign,
          },
          {
            intlMessage: messages.archiveCampaign,
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
            <FormattedMessage {...messages.emailHeaderStatus} />
            <Icon type="down" />
          </div>
        ),
        selectedItems: filter.statuses.map((status: CampaignStatus) => ({
          key: status,
          value: status,
        })),
        items: statusItems,
        getKey: (item: { key: CampaignStatus; value: CampaignStatus }) =>
          item.key,
        display: (item: { key: CampaignStatus; value: CampaignStatus }) =>
          item.value,
        handleMenuClick: (
          values: Array<{ key: CampaignStatus; value: CampaignStatus }>,
        ) => {
          onFilterChange({
            statuses: values.map(item => item.value),
          });
        },
      },
    ];

    return hasEmailCampaigns ? (
      <div className="mcs-table-container">
        <TableViewFilters
          columns={dataColumns}
          actionsColumnsDefinition={actionColumns}
          searchOptions={searchOptions}
          dateRangePickerOptions={dateRangePickerOptions}
          filtersOptions={filtersOptions}
          columnsVisibilityOptions={columnsVisibilityOptions}
          dataSource={dataSource}
          loading={isFetchingCampaigns}
          pagination={pagination}
          labelsOptions={labelsOptions}
        />
      </div>
    ) : (
      <EmptyTableView iconType="email" message={formatMessage(messages.noCampaign)} />
    );
  }
}

export default compose<Props, EmailCampaignsTableProps>(
  injectIntl,
  withRouter,
)(EmailCampaignsTable);
