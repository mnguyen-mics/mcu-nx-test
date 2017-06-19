import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { Link, withRouter } from 'react-router-dom';
import { Button } from 'antd';

import { Card } from '../../../../components/Card';
import { TableViewLight } from '../../../../components/TableView';
import { formatMetric } from '../../../../utils/MetricHelper';

import { getEmailBlastTableView } from '../../../../state/Campaign/Email/selectors';

class CampaignEmailTable extends Component {

  render() {

    const {
      match: {
        params: {
          organisationId
        }
      },
      translations,
      isFetchingBlasts,
      isFetchingBlastsStat,
      dataSet
    } = this.props;

    const renderMetricData = (value, numeralFormat, currency = '') => {
      if (isFetchingBlastsStat) {
        return (<i className="mcs-loading" />);
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
        key: 'blastName',
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
            callback: this.editCampaign
          }, {
            translationKey: 'ARCHIVE',
            callback: this.archiveCampaign
          }
        ]
      }
    ];

    const columnsDefinitions = {
      dataColumnsDefinition: dataColumns,
      actionsColumnsDefinition: actionColumns
    };

    const buttons = (<Link to={`/${organisationId}/campaigns/email/edit/`}><Button type="primary"><FormattedMessage id="NEW_EMAIL_BLAST" /></Button></Link>);

    return (
      <Card title={translations.EMAIL_BLASTS} buttons={buttons}>
        <TableViewLight
          columnsDefinitions={columnsDefinitions}
          dataSource={dataSet}
          onChange={() => {}}
          loading={isFetchingBlasts}
        />
      </Card>);
  }

}

CampaignEmailTable.propTypes = {
  translations: PropTypes.objectOf(PropTypes.string).isRequired,
  match: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  isFetchingBlasts: PropTypes.bool.isRequired,
  isFetchingBlastsStat: PropTypes.bool.isRequired,
  dataSet: PropTypes.arrayOf(PropTypes.object).isRequired,
};

const mapStateToProps = state => ({
  translations: state.translations,
  isFetchingBlasts: state.campaignEmailSingle.emailBlastApi.isFetching,
  isFetchingBlastsStat: state.campaignEmailSingle.emailBlastPerformanceApi.isFetching,
  dataSet: getEmailBlastTableView(state)
});

CampaignEmailTable = connect(
  mapStateToProps
)(CampaignEmailTable);

CampaignEmailTable = withRouter(CampaignEmailTable);

export default CampaignEmailTable;
