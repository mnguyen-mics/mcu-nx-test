import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from 'react-intl';
import { Link, withRouter } from 'react-router-dom';
import { Switch } from 'antd';
import { compose } from 'recompose';

import messages from '../messages';

import { TableView } from '../../../../../components/TableView';
import { formatMetric } from '../../../../../utils/MetricHelper';
import McsIcons from '../../../../../components/McsIcons';

class DisplayCampaignAdGroupTable extends Component {

  editCampaign = (adgroup) => {
    const {
      match: {
        params: {
          organisationId,
          campaignId,
        },
      },
      history,
    } = this.props;

    const editUrl = `/${organisationId}/campaigns/display/expert/edit/${campaignId}/edit-ad-group/${adgroup.id}`;

    history.push(editUrl);
  }

  render() {
    const {
      match: {
        params: {
          organisationId,
          campaignId,
        },
      },
      isFetching,
      isFetchingStat,
      dataSet,
    } = this.props;

    const renderMetricData = (value, numeralFormat, currency = '') => {
      if (isFetchingStat) {
        return (<i className="mcs-table-cell-loading" />);
      }
      const unlocalizedMoneyPrefix = currency === 'EUR' ? '€ ' : '';
      return formatMetric(value, numeralFormat, unlocalizedMoneyPrefix);
    };

    const changeAdGroupStatus = (record, checked) => {
      const {
        updateAdGroup,
        intl: { formatMessage },
      } = this.props;
      const status = checked ? 'ACTIVE' : 'PAUSED';
      const initialStatus = checked ? 'PAUSED' : 'ACTIVE';
      const successMessage = (checked
        ? {
          title: formatMessage(messages.notificationSuccess),
          body: formatMessage(messages.notificationAdGroupActivationSuccess, { name: record.name }),
        }
        : {
          title: formatMessage(messages.notificationSuccess),
          body: formatMessage(messages.notificationAdGroupPauseSuccess, { name: record.name }),
        }
      );
      const errorMessage = (checked
        ? {
          title: formatMessage(messages.notificationError),
          body: formatMessage(messages.notificationAdGroupActivationError, { name: record.name }),
        }
        : {
          title: formatMessage(messages.notificationError),
          body: formatMessage(messages.notificationAdGroupPauseError, { name: record.name }),
        }
      );

      updateAdGroup(
        record.id,
        {
          status,
          type: 'DISPLAY',
        },
        successMessage,
        errorMessage,
        {
          status: initialStatus,
          type: 'DISPLAY',
        });
    };


    const dataColumns = [
      {
        translationKey: 'STATUS',
        key: 'status',
        isHideable: false,
        render: (text, record) => (
          <span>
            <Switch
              className="mcs-table-switch"
              checked={text === 'ACTIVE'}
              onChange={(checked) => changeAdGroupStatus(record, checked)}
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
        render: (text, record) => (
          <Link
            className="mcs-campaigns-link"
            to={`v2/o/${organisationId}/campaigns/display/${campaignId}/adgroup/${record.id}`}
          >{text}
          </Link>
        ),
      },
      {
        translationKey: 'IMPRESSIONS',
        key: 'impressions',
        isVisibleByDefault: true,
        isHideable: true,
        render: text => renderMetricData(text, '0,0'),
      },
      {
        translationKey: 'CLICKS',
        key: 'clicks',
        isVisibleByDefault: true,
        isHideable: true,
        render: text => renderMetricData(text, '0,0'),
      },
      {
        translationKey: 'CPM',
        key: 'cpm',
        isVisibleByDefault: true,
        isHideable: true,
        render: text => renderMetricData(text, '0,0.00', 'EUR'),
      },
      {
        translationKey: 'CTR',
        key: 'ctr',
        isVisibleByDefault: true,
        isHideable: true,
        render: text => renderMetricData(text / 100, '0,00 %'),
      },
      {
        translationKey: 'CPC',
        key: 'cpc',
        isVisibleByDefault: true,
        isHideable: true,
        render: text => renderMetricData(text, '0,0.00', 'EUR'),
      },
      {
        translationKey: 'IMPRESSIONS_COST',
        key: 'impressions_cost',
        isVisibleByDefault: true,
        isHideable: true,
        render: text => renderMetricData(text, '0,0.00', 'EUR'),
      },
      {
        translationKey: 'CPA',
        key: 'cpa',
        isVisibleByDefault: true,
        isHideable: true,
        render: text => renderMetricData(text, '0,0.00', 'EUR'),
      },
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
            callback: this.archiveCampaign,
          },
        ],
      },
    ];

    const columnsDefinitions = {
      dataColumnsDefinition: dataColumns,
      actionsColumnsDefinition: actionColumns,
    };

    return (
      <TableView
        columnsDefinitions={columnsDefinitions}
        dataSource={dataSet}
        loading={isFetching}
      />
    );
  }

}

DisplayCampaignAdGroupTable.propTypes = {
  match: PropTypes.shape().isRequired,
  history: PropTypes.shape().isRequired,
  isFetching: PropTypes.bool.isRequired,
  isFetchingStat: PropTypes.bool.isRequired,
  dataSet: PropTypes.arrayOf(PropTypes.object).isRequired,
  updateAdGroup: PropTypes.func.isRequired,
  intl: intlShape.isRequired,
};


DisplayCampaignAdGroupTable = compose(
  injectIntl,
  withRouter,
)(DisplayCampaignAdGroupTable);


export default DisplayCampaignAdGroupTable;
