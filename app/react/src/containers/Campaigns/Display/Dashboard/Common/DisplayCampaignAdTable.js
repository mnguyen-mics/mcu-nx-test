import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from 'react-intl';
import { withRouter } from 'react-router-dom';
import { Tooltip, Popover, Switch } from 'antd';
import { compose } from 'recompose';

import { TableView } from '../../../../../components/TableView/index.ts';
import { formatMetric } from '../../../../../utils/MetricHelper.ts';
import McsIcons from '../../../../../components/McsIcons.tsx';
import ButtonStyleless from '../../../../../components/ButtonStyleless.tsx';
import messages from '../messages.ts';

class DisplayCampaignAdTable extends Component {

  editCampaign = (ad) => {
    const {
      match: {
        params: {
          organisationId,
        },
      },
      history,
      location,
    } = this.props;

    const editUrl = `/v2/o/${organisationId}/creatives/display/edit/${ad.id}`;

    history.push({
      pathname: editUrl,
      state: { from: `${location.pathname}${location.search}` }
    });
  };

  render() {

    const {
      match: {
        params: {
          organisationId,
        },
      },
      location,
      history,
      isFetching,
      isFetchingStat,
      dataSet,
      intl: { formatMessage },
    } = this.props;

    const renderMetricData = (value, numeralFormat, currency = '') => {
      if (isFetchingStat) {
        return (<i className="mcs-table-cell-loading" />);
      }
      const unlocalizedMoneyPrefix = currency === 'EUR' ? '€ ' : '';
      return formatMetric(value, numeralFormat, unlocalizedMoneyPrefix);
    };

    const renderPopover = (recordId, recordName) => {
      return (
        <div className="mcs-ad-popover">
          <span className="mcs-ad-helper" />
          <img
            src={`https://ads.mediarithmics.com/ads/screenshot?rid=${recordId}`}
            alt={recordName}
          />
        </div>
      );
    };

    const sorter = (a, b, key) => {
      if (a[key] === undefined && b[key] === undefined) {
        return 0;
      }
      if (a[key] === undefined) {
        return -b[key];
      }
      if (b[key] === undefined) {
        return a[key];
      }
      return a[key] - b[key];
    };

    const changeAdStatus = (record, checked) => {
      const {
        updateAd,
      } = this.props;

      const status = checked ? 'ACTIVE' : 'PAUSED';
      const initialStatus = checked ? 'PAUSED' : 'ACTIVE';
      const successMessage = (checked
        ? {
          title: formatMessage(messages.notificationSuccess),
          body: formatMessage(messages.notificationAdActivationSuccess, { name: record.name }),
        }
        : {
          title: formatMessage(messages.notificationSuccess),
          body: formatMessage(messages.notificationAdPauseSuccess, { name: record.name }),
        }
      );
      const errorMessage = (checked
        ? {
          title: formatMessage(messages.notificationError),
          body: formatMessage(messages.notificationAdActivationError, { name: record.name }),
        }
        : {
          title: formatMessage(messages.notificationError),
          body: formatMessage(messages.notificationAdPauseError, { name: record.name }),
        }
      );
      updateAd(
        record.id,
        {
          status,
          type: 'DISPLAY_AD',
        },
        successMessage,
        errorMessage,
        {
          status: initialStatus,
          type: 'DISPLAY',
        },
      );
    };

    const dataColumns = [
      {
        key: 'creative_audit_status',
        isHideable: false,
        render: (text) => (
          <Tooltip
            title={text === 'AUDIT_PASSED'
              ? formatMessage(messages.adAuditSuccess)
              : formatMessage(messages.adAuditError)
            }
          >
            <McsIcons
              className={text === 'AUDIT_PASSED' ? 'font-success' : 'font-error'}
              type={text === 'AUDIT_PASSED' ? 'check' : 'close'}
            />
          </Tooltip>
        ),
        width: 10,
      },
      {
        translationKey: 'STATUS',
        key: 'status',
        isHideable: false,
        render: (text, record) => (
          <span>
            <Switch
              className="mcs-table-switch"
              checked={text === 'ACTIVE'}
              onChange={(checked) => changeAdStatus(record, checked)}
              checkedChildren={<McsIcons style={{ verticalAlign: 'middle' }} type="play" />}
              unCheckedChildren={<McsIcons style={{ verticalAlign: 'middle' }} type="pause" />}
            />
          </span>
        ),
      },
      {
        translationKey: 'NAME',
        key: 'name',
        isHideable: false,
        render: (text, record) => {
          const editCreative = () => {
            history.push({
              pathname: `/v2/o/${organisationId}/creatives/display/edit/${record.creative_id}`,
              state: { from: `${location.pathname}${location.search}` },
            });
          };
          return (
            <Popover
              content={renderPopover(record.creative_id, text)}
              title={text}
            >
              <ButtonStyleless onClick={editCreative}>{text}</ButtonStyleless>
            </Popover>
          );
        },
      },
      {
        translationKey: 'IMPRESSIONS',
        key: 'impressions',
        isVisibleByDefault: true,
        isHideable: true,
        render: text => renderMetricData(text, '0,0'),
        sorter: (a, b) => sorter(a, b, 'impressions'),
      },
      {
        translationKey: 'CLICKS',
        key: 'clicks',
        isVisibleByDefault: true,
        isHideable: true,
        render: text => renderMetricData(text, '0,0'),
        sorter: (a, b) => sorter(a, b, 'clicks'),
      },
      {
        translationKey: 'CPM',
        key: 'cpm',
        isVisibleByDefault: true,
        isHideable: true,
        render: text => renderMetricData(text, '0,0.00', 'EUR'),
        sorter: (a, b) => sorter(a, b, 'cpm'),
      },
      {
        translationKey: 'CTR',
        key: 'ctr',
        isVisibleByDefault: true,
        isHideable: true,
        render: text => renderMetricData(parseFloat(text) / 100, '0.000 %'),
        sorter: (a, b) => sorter(a, b, 'ctr'),
      },
      {
        translationKey: 'CPC',
        key: 'cpc',
        isVisibleByDefault: true,
        isHideable: true,
        render: text => renderMetricData(text, '0,0.00', 'EUR'),
        sorter: (a, b) => sorter(a, b, 'cpc'),
      },
      {
        translationKey: 'IMPRESSIONS_COST',
        key: 'impressions_cost',
        isVisibleByDefault: true,
        isHideable: true,
        render: text => renderMetricData(text, '0,0.00', 'EUR'),
        sorter: (a, b) => sorter(a, b, 'impressions_cost'),
      },
      // TODO UNCOMMENT WHEN BACKEND IS FIXED
      // {
      //   translationKey: 'CPA',
      //   key: 'cpa',
      //   isVisibleByDefault: true,
      //   isHideable: true,
      //   render: text => renderMetricData(text, '0,0.00', 'EUR'),
      //   sorter: (a, b) => sorter(a, b, 'cpa'),
      // },
    ];

    const actionColumns = [
      {
        key: 'action',
        actions: [
          {
            translationKey: 'EDIT',
            callback: this.editCampaign,
          }, {
            translationKey: 'ARCHIVE',
            callback: this.archiveAd,
          },
        ],
      },
    ];

    return (
      <TableView
        columns={dataColumns}
        actionsColumnsDefinition={actionColumns}
        dataSource={dataSet}
        loading={isFetching}
      />
    );
  }
}

DisplayCampaignAdTable.propTypes = {
  match: PropTypes.shape().isRequired,
  history: PropTypes.shape().isRequired,
  isFetching: PropTypes.bool.isRequired,
  isFetchingStat: PropTypes.bool.isRequired,
  dataSet: PropTypes.arrayOf(PropTypes.object).isRequired,
  updateAd: PropTypes.func.isRequired,
  intl: intlShape.isRequired,
  location: PropTypes.shape().isRequired,
};

DisplayCampaignAdTable = compose(
  injectIntl,
  withRouter,
)(DisplayCampaignAdTable);

export default DisplayCampaignAdTable;
