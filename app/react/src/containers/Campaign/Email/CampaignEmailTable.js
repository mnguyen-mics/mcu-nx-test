import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import Link from 'react-router/lib/Link';
import { Button } from 'antd';

import { Card } from '../../../components/Card';
import { TableViewLight } from '../../../components/TableView';
import { formatMetric } from '../../../utils/MetricHelper';

import {
  getEmailBlastTableView
 } from '../../../state/Campaign/Email/selectors';


class CampaignEmailTable extends Component {

  render() {

    const {
      activeWorkspace: {
        organisationId,
        workspaceId
      },
      translations,
      isLoading,
      dataset
    } = this.props;

    const renderMetricData = (value, numeralFormat, currency = '') => {
      if (null) {
        return (<i className="mcs-loading" />); // (<span>loading...</span>);
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

    const buttons = (<Link to={`/${workspaceId}/campaigns/email/edit/`}><Button type="primary"><FormattedMessage id="NEW_EMAIL_BLAST" /></Button></Link>);

    return (
      <Card title={translations.EMAIL_BLASTS} buttons={buttons}>
        <TableViewLight
          columnsDefinitions={columnsDefinitions}
          dataSource={dataset}
          onChange={() => {}}
          loading={isLoading}
        />
      </Card>);
  }

}

CampaignEmailTable.propTypes = {
  activeWorkspace: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  translations: PropTypes.objectOf(PropTypes.string).isRequired,
  isLoading: PropTypes.bool.isRequired,
  dataset: PropTypes.arrayOf(PropTypes.object).isRequired,
};

const mapStateToProps = state => ({
  translations: state.translationsState.translations,
  activeWorkspace: state.sessionState.activeWorkspace,
  isLoading: state.campaignEmailSingle.emailBlastApi.isFetching,
  dataset: getEmailBlastTableView(state)
});

const mapDispatchToProps = {};

CampaignEmailTable = connect(
  mapStateToProps,
  mapDispatchToProps
)(CampaignEmailTable);

export default CampaignEmailTable;
