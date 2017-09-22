import React from 'react';
import PropTypes from 'prop-types';

import { Link } from 'react-router-dom';
import { Icon } from 'antd';
import { FormattedMessage, intlShape, injectIntl } from 'react-intl';

import {
  TableViewFilters,
  EmptyTableView,
} from '../../../../components/TableView';
import messages from './messages';
import { formatMetric } from '../../../../utils/MetricHelper';
import { campaignStatuses } from '../../constants';

function EmailCampaignsTable({
  isFetchingCampaigns,
  isFetchingStats,
  dataSource,
  totalCampaigns,
  noCampaignYet,
  onFilterChange,
  onArchiveCampaign,
  onEditCampaign,
  intl: { formatMessage },
  filter
}) {

  const searchOptions = {
    isEnabled: true,
    placeholder: formatMessage(messages.searchPlaceholder),
    onSearch: value => onFilterChange({
      keywords: value,
    }),
    defaultValue: filter.keywords,
  };

  const dateRangePickerOptions = {
    isEnabled: true,
    onChange: (values) => onFilterChange({
      rangeType: values.rangeType,
      lookbackWindow: values.lookbackWindow,
      from: values.from,
      to: values.to,
    }),
    values: {
      rangeType: filter.rangeType,
      lookbackWindow: filter.lookbackWindow,
      from: filter.from,
      to: filter.to,
    },
  };

  const columnsVisibilityOptions = {
    isEnabled: true,
  };

  const pagination = {
    currentPage: filter.currentPage,
    pageSize: filter.pageSize,
    total: totalCampaigns,
    onChange: (page) => onFilterChange({
      currentPage: page,
    }),
    onShowSizeChange: (current, size) => onFilterChange({
      pageSize: size,
      currentPage: 1,
    }),
  };

  const renderMetricData = (value, numeralFormat, currency = '') => {
    if (isFetchingStats) {
      return (<i className="mcs-table-cell-loading" />); // (<span>loading...</span>);
    }
    const unlocalizedMoneyPrefix = currency === 'EUR' ? '€ ' : '';
    return formatMetric(value, numeralFormat, unlocalizedMoneyPrefix);
  };

  const dataColumns = [
      // {
      //   intlMessage: messages.emailHeaderStatus,
      //   key: 'status',
      //   isHideable: false,
      //   // title={formatMessage(messages[text])}
      //   render: text => <Tooltip placement="top" title={text}><span className={`mcs-campaigns-status-${text.toLowerCase()}`}><McsIcons type="status" /></span></Tooltip>
      // },
    {
      intlMessage: messages.emailHeaderName,
      key: 'name',
      isHideable: false,
      render: (text, record) => (
        <Link
          className="mcs-campaigns-link"
          to={`/v2/o/${record.organisation_id}/campaigns/email/${record.id}`}
        >{text}
        </Link>
        ),
    },
    {
      intlMessage: messages.emailHeaderSent,
      key: 'email_sent',
      isVisibleByDefault: true,
      isHideable: true,
      render: text => renderMetricData(text, '0,0'),
    },
    {
      intlMessage: messages.emailHeaderHardBounced,
      key: 'email_hard_bounced',
      isVisibleByDefault: true,
      isHideable: true,
      render: text => renderMetricData(text, '0,0'),
    },
    {
      intlMessage: messages.emailHeaderSoftBounced,
      key: 'email_soft_bounced',
      isVisibleByDefault: true,
      isHideable: true,
      render: text => renderMetricData(text, '0,0'),
    },
    {
      intlMessage: messages.emailHeaderClicks,
      key: 'clicks',
      isVisibleByDefault: true,
      isHideable: true,
      render: text => renderMetricData(text, '0,0'),
    },
    {
      intlMessage: messages.emailHeaderImpressions,
      key: 'impressions',
      isVisibleByDefault: true,
      isHideable: true,
      render: text => renderMetricData(text, '0,0'),
    },
  ];

  const actionColumns = [
    {
      key: 'action',
      actions: [
        {
          intlMessage: messages.editCampaign,
          callback: onEditCampaign,
        }, {
          intlMessage: messages.archiveCampaign,
          callback: onArchiveCampaign,
        },
      ],
    },
  ];

  const statusItems = campaignStatuses.map(status => ({ key: status, value: status }));

  const filtersOptions = [
    {
      name: 'status',
      displayElement: (
        <div>
          <FormattedMessage {...messages.emailHeaderStatus} />
          <Icon type="down" />
        </div>
        ),
      menuItems: {
        handleMenuClick: value => {
          onFilterChange({
            statuses: value.status.map(item => item.value),
          });
        },
        selectedItems: filter.statuses.map(status => ({ key: status, value: status })),
        items: statusItems,
      },
    },
  ];

  const columnsDefinitions = {
    dataColumnsDefinition: dataColumns,
    actionsColumnsDefinition: actionColumns,
  };

  return (noCampaignYet)
      ? <EmptyTableView iconType="email" text="EMPTY_EMAILS" />
      : (
        <div className="mcs-table-container">
          <TableViewFilters
            columnsDefinitions={columnsDefinitions}
            searchOptions={searchOptions}
            dateRangePickerOptions={dateRangePickerOptions}
            filtersOptions={filtersOptions}
            columnsVisibilityOptions={columnsVisibilityOptions}
            dataSource={dataSource}
            loading={isFetchingCampaigns}
            pagination={pagination}
          />
        </div>
     );
}

EmailCampaignsTable.propTypes = {
  noCampaignYet: PropTypes.bool.isRequired,
  isFetchingCampaigns: PropTypes.bool.isRequired,
  isFetchingStats: PropTypes.bool.isRequired,
  dataSource: PropTypes.arrayOf(PropTypes.object).isRequired,
  totalCampaigns: PropTypes.number.isRequired,
  filter: PropTypes.shape().isRequired,
  onFilterChange: PropTypes.func.isRequired,
  onArchiveCampaign: PropTypes.func.isRequired,
  onEditCampaign: PropTypes.func.isRequired,
  intl: intlShape.isRequired,
};

export default injectIntl(EmailCampaignsTable);
