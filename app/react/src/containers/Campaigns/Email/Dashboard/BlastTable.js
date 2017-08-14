import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { defineMessages, FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';
import { Menu, Dropdown, Icon } from 'antd';

import { TableView } from '../../../../components/TableView';
import { formatMetric } from '../../../../utils/MetricHelper';
import { ReactRouterPropTypes } from '../../../../validators/proptypes';
import { withMcsRouter } from '../../../Helpers';
import { getEmailBlastTableView } from '../../../../state/Campaign/Email/selectors';

const blastStatusMessage = defineMessages({
  scenario_activated: {
    id: 'blast.status.scenario_activated',
    defaultMessage: 'Scenario activation',
  },
  pending: {
    id: 'blast.status.pending',
    defaultMessage: 'Pending',
  },
  scheduled: {
    id: 'blast.status.scheduled',
    defaultMessage: 'Scheduled',
  },
  finished: {
    id: 'blast.status.finished',
    defaultMessage: 'Sent',
  },
  error: {
    id: 'blast.status.error',
    defaultMessage: 'Error',
  },
});

const availableStatusTransition = {
  PENDING: ['SCENARIO_ACTIVATED', 'SCHEDULED'],
  SCENARIO_ACTIVATED: ['PENDING'],
  SCHEDULED: ['PENDING'],
};

class BlastTable extends Component {

  editBlast = (blast) => {
    const {
      organisationId,
      match: { params: { campaignId } },
      history,
    } = this.props;

    history.push(`/v2/o/${organisationId}/campaigns/email/${campaignId}/blasts/${blast.id}/edit`);
  }

  getStatusMenu = (blast) => {
    const menuItems = (availableStatusTransition[blast.status] || []).map(status =>
      <Menu.Item key={`${blast.id}-${status}`}>
        <FormattedMessage {...blastStatusMessage[status.toLowerCase()]} />
      </Menu.Item>,
    );

    return (
      <Menu onClick={() => {}}>
        {menuItems}
      </Menu>
    );
  }

  render() {

    const {
      match: {
        params: {
          organisationId,
        },
      },
      isFetchingBlasts,
      isFetchingBlastsStat,
      dataSet,
    } = this.props;

    const renderMetricData = (value, numeralFormat, currency = '') => {
      if (isFetchingBlastsStat) {
        return (<i className="mcs-table-cell-loading" />);
      }
      const unlocalizedMoneyPrefix = currency === 'EUR' ? '€ ' : '';
      return formatMetric(value, numeralFormat, unlocalizedMoneyPrefix);
    };


    const dataColumns = [
      {
        translationKey: 'STATUS',
        key: 'status',
        isHiddable: false,
        render: (status, blast) => (
          <Dropdown overlay={this.getStatusMenu(blast)} trigger={['click']}>
            <a className="ant-dropdown-link">
              <FormattedMessage {...blastStatusMessage[status.toLowerCase()]} />
              <Icon type="down" />
            </a>
          </Dropdown>
        ),
      },
      {
        translationKey: 'NAME',
        key: 'blast_name',
        isHiddable: false,
        render: (blastName, blast) => <Link className="mcs-campaigns-link" to={`v2/o/${organisationId}/campaign/email/${blast.id}`}>{blastName}</Link>,
      },
      {
        translationKey: 'EMAIL_SENT',
        key: 'email_sent',
        isVisibleByDefault: true,
        isHiddable: true,
        render: emailSent => renderMetricData(emailSent, '0,0'),
      },
      {
        translationKey: 'EMAIL_HARD_BOUNCED',
        key: 'email_hard_bounced',
        isVisibleByDefault: true,
        isHiddable: true,
        render: emailHardBounced => renderMetricData(emailHardBounced, '0,0'),
      },
      {
        translationKey: 'EMAIL_SOFT_BOUNCED',
        key: 'email_soft_bounced',
        isVisibleByDefault: true,
        isHiddable: true,
        render: emailSoftBounced => renderMetricData(emailSoftBounced, '0,0'),
      },
      {
        translationKey: 'CLICKS',
        key: 'clicks',
        isVisibleByDefault: true,
        isHiddable: true,
        render: clicks => renderMetricData(clicks, '0,0'),
      },
      {
        translationKey: 'IMPRESSIONS',
        key: 'impressions',
        isVisibleByDefault: true,
        isHiddable: true,
        render: impressions => renderMetricData(impressions, '0,0'),
      },
    ];

    const actionColumns = [
      {
        key: 'action',
        actions: [
          {
            translationKey: 'EDIT',
            callback: this.editBlast,
          }, {
            translationKey: 'ARCHIVE',
            callback: this.archiveBlast,
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
        loading={isFetchingBlasts}
      />
    );
  }

}

BlastTable.propTypes = {
  organisationId: PropTypes.string.isRequired,
  match: ReactRouterPropTypes.match.isRequired,
  history: ReactRouterPropTypes.history.isRequired,
  isFetchingBlasts: PropTypes.bool.isRequired,
  isFetchingBlastsStat: PropTypes.bool.isRequired,
  dataSet: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default compose(
  withMcsRouter,
  connect(
    state => ({
      isFetchingBlasts: state.emailCampaignSingle.emailBlastApi.isFetching,
      isFetchingBlastsStat: state.emailCampaignSingle.emailBlastPerformance.isFetching,
      dataSet: getEmailBlastTableView(state),
    }),
  ),
)(BlastTable);
