import * as React from 'react';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';
import { Icon, Tooltip, Modal } from 'antd';
import { FormattedMessage, injectIntl, InjectedIntlProps } from 'react-intl';
import {
  TableViewFilters,
  EmptyTableView,
} from '../../../../components/TableView/index';
import { McsIcon } from '../../../../components/index';
import messages from './messages';
import { formatMetric } from '../../../../utils/MetricHelper';
import { campaignStatuses } from '../../constants';
import { Index } from '../../../../utils';
import { EmailCampaignResource } from '../../../../models/campaign/email';
import { LabelsSelectorProps } from '../../../../components/LabelsSelector';
import {
  parseSearch,
  updateSearch,
} from '../../../../utils/LocationSearchHelper';
import { EMAIL_SEARCH_SETTINGS } from './constants';
import { CampaignResource } from '../../../../models/campaign/CampaignResource';
import EmailCampaignService from '../../../../services/EmailCampaignService';
import { CampaignStatus } from '../../../../models/campaign';
import { McsDateRangeValue } from '../../../../components/McsDateRangePicker';
import { compose } from 'recompose';

interface EmailCampaignsTableProps {
  dataSource: CampaignResource[];
  fetchCampaignAndStats: (
    organisationId: string,
    filter: Index<any>,
    checkHasCampaigns?: boolean,
  ) => void;
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
  handleArchiveCampaign = (campaign: EmailCampaignResource) => {
    const {
      match: {
        params: { organisationId },
      },
      fetchCampaignAndStats,
      location: { pathname, state, search },
      history,
      intl,
      dataSource,
    } = this.props;

    const filter = parseSearch(search, EMAIL_SEARCH_SETTINGS);

    const reloadEmailCampaign = () => {
      fetchCampaignAndStats(organisationId, filter);
    };

    Modal.confirm({
      title: intl.formatMessage(messages.confirmArchiveModalTitle),
      content: intl.formatMessage(messages.confirmArchiveModalContent),
      iconType: 'exclamation-circle',
      okText: intl.formatMessage(messages.confirmArchiveModalOk),
      cancelText: intl.formatMessage(messages.confirmArchiveModalCancel),
      onOk() {
        EmailCampaignService.deleteEmailCampaign(campaign.id).then(() => {
          if (dataSource.length === 1 && filter.currentPage !== 1) {
            const newFilter = {
              ...filter,
              currentPage: filter.currentPage - 1,
              automated: true,
            };
            reloadEmailCampaign();
            history.replace({
              pathname: pathname,
              search: updateSearch(search, newFilter),
              state: state,
            });
          }
          reloadEmailCampaign();
        });
      },
      onCancel() {
        //
      },
    });
  };

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
        render: (text: string, record: CampaignResource) => (
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
            callback: this.handleArchiveCampaign,
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
      <EmptyTableView iconType="email" text="EMPTY_EMAILS" />
    ) : (
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
    );
  }
}

export default compose<Props, EmailCampaignsTableProps>(
  injectIntl,
  withRouter,
)(EmailCampaignsTable);
