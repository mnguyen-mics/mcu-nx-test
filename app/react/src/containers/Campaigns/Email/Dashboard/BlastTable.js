import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';

import { TableView } from '../../../../components/TableView';
import { formatMetric } from '../../../../utils/MetricHelper';
import { ReactRouterPropTypes } from '../../../../validators/proptypes';
import { withMcsRouter } from '../../../Helpers';
import { getEmailBlastTableView } from '../../../../state/Campaign/Email/selectors';

class BlastTable extends Component {

  editBlast = (blast) => {
    const {
      organisationId,
      match: { params: { campaignId } },
      history
    } = this.props;

    history.push(`/v2/o/${organisationId}/campaigns/email/${campaignId}/blasts/${blast.id}/edit`);
  }

  render() {

    const {
      match: {
        params: {
          organisationId
        }
      },
      isFetchingBlasts,
      isFetchingBlastsStat,
      dataSet
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
        key: 'sendDate',
        isHiddable: false,
        render: text => {
          const mydate = new Date(text);
          const today = new Date();
          let status = 'PENDING';
          if (today > mydate) {
            status = 'SENT';
          }
          return (<span className={`mcs-campaigns-status-${status}`}><FormattedMessage id={status} /></span>);
        }
      },
      {
        translationKey: 'NAME',
        key: 'blast_name',
        isHiddable: false,
        render: (text, record) => <Link className="mcs-campaigns-link" to={`v2/o/${organisationId}/campaign/email/${record.id}`}>{text}</Link>
      },
      {
        translationKey: 'EMAIL_SENT',
        key: 'email_sent',
        isVisibleByDefault: true,
        isHiddable: true,
        render: text => renderMetricData(text, '0,0')
      },
      {
        translationKey: 'EMAIL_HARD_BOUNCED',
        key: 'email_hard_bounced',
        isVisibleByDefault: true,
        isHiddable: true,
        render: text => renderMetricData(text, '0,0')
      },
      {
        translationKey: 'EMAIL_SOFT_BOUNCED',
        key: 'email_soft_bounced',
        isVisibleByDefault: true,
        isHiddable: true,
        render: text => renderMetricData(text, '0,0')
      },
      {
        translationKey: 'CLICKS',
        key: 'clicks',
        isVisibleByDefault: true,
        isHiddable: true,
        render: text => renderMetricData(text, '0,0')
      },
      {
        translationKey: 'IMPRESSIONS',
        key: 'impressions',
        isVisibleByDefault: true,
        isHiddable: true,
        render: text => renderMetricData(text, '0,0')
      }
    ];

    const actionColumns = [
      {
        key: 'action',
        actions: [
          {
            translationKey: 'EDIT',
            callback: this.editBlast
          }, {
            translationKey: 'ARCHIVE',
            callback: this.archiveBlast
          }
        ]
      }
    ];

    const columnsDefinitions = {
      dataColumnsDefinition: dataColumns,
      actionsColumnsDefinition: actionColumns
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
      isFetchingBlasts: state.campaignEmailSingle.emailBlastApi.isFetching,
      isFetchingBlastsStat: state.campaignEmailSingle.emailBlastPerformanceApi.isFetching,
      dataSet: getEmailBlastTableView(state)
    })
  )
)(BlastTable);
