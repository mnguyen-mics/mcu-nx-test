import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import lodash from 'lodash';
import Link from 'react-router/lib/Link';
import { Icon, Modal } from 'antd';
import { FormattedMessage } from 'react-intl';

import { TableView } from '../../../components/TableView';

import * as CampaignsEmailActions from '../../../state/Campaigns/Email/actions';

import {
  EMAIL_QUERY_SETTINGS,

  updateQueryWithParams,
  deserializeQuery
} from '../RouteQuerySelector';

import { formatMetric } from '../../../utils/MetricHelper';
import { CampaignStatuses } from '../../../constants/CampaignConstant';

import {
  getTableDataSource
 } from '../../../state/Campaigns/Email/selectors';

class CampaignsEmailTable extends Component {

  constructor(props) {
    super(props);
    this.updateQueryParams = this.updateQueryParams.bind(this);
    this.archiveCampaign = this.archiveCampaign.bind(this);
    this.editCampaign = this.editCampaign.bind(this);
  }

  componentDidMount() {
    const {
      activeWorkspace: {
        organisationId
      },
      query,
      loadCampaignsEmailDataSource
    } = this.props;

    const filter = deserializeQuery(query, EMAIL_QUERY_SETTINGS);
    loadCampaignsEmailDataSource(organisationId, filter);
  }

  componentWillReceiveProps(nextProps) {
    const {
      query,
      activeWorkspace: {
        workspaceId
      },

      loadCampaignsEmailDataSource
    } = this.props;

    const {
      query: nextQuery,
      activeWorkspace: {
        workspaceId: nextWorkspaceId,
        organisationId
      },
    } = nextProps;

    if (!lodash.isEqual(query, nextQuery) || workspaceId !== nextWorkspaceId) {
      const filter = deserializeQuery(nextQuery, EMAIL_QUERY_SETTINGS);
      loadCampaignsEmailDataSource(organisationId, filter);
    }
  }

  componentWillUnmount() {
    this.props.resetCampaignsEmailTable();
  }

  updateQueryParams(params) {
    const {
      router,
      query: currentQuery
    } = this.props;

    const location = router.getCurrentLocation();
    router.replace({
      pathname: location.pathname,
      query: updateQueryWithParams(currentQuery, params, EMAIL_QUERY_SETTINGS)
    });
  }

  render() {
    const {
      query,
      activeWorkspace: {
        workspaceId
      },
      translations,
      isFetchingCampaignsEmail,
      isFetchingCampaignsStat,
      dataSource,
      totalCampaignsEmail
    } = this.props;

    const filter = deserializeQuery(query, EMAIL_QUERY_SETTINGS);

    const searchOptions = {
      isEnabled: true,
      placeholder: translations.SEARCH_CAMPAIGNS_EMAIL,
      onSearch: value => this.updateQueryParams({
        keywords: value
      }),
      defaultValue: filter.keywords
    };

    const dateRangePickerOptions = {
      isEnabled: true,
      onChange: (values) => this.updateQueryParams({
        rangeType: values.rangeType,
        lookbackWindow: values.lookbackWindow,
        from: values.from,
        to: values.to,
      }),
      values: {
        rangeType: filter.rangeType,
        lookbackWindow: filter.lookbackWindow,
        from: filter.from,
        to: filter.to
      }
    };

    const columnsVisibilityOptions = {
      isEnabled: true
    };

    const pagination = {
      currentPage: filter.currentPage,
      pageSize: filter.pageSize,
      total: totalCampaignsEmail,
      onChange: (page) => this.updateQueryParams({
        currentPage: page
      }),
      onShowSizeChange: (current, size) => this.updateQueryParams({
        pageSize: size
      })
    };

    const renderMetricData = (value, numeralFormat, currency = '') => {
      if (isFetchingCampaignsStat) {
        return (<i className="mcs-loading" />); // (<span>loading...</span>);
      }
      const unlocalizedMoneyPrefix = currency === 'EUR' ? '€ ' : '';
      return formatMetric(value, numeralFormat, unlocalizedMoneyPrefix);
    };

    const dataColumns = [
      {
        translationKey: 'STATUS',
        key: 'status',
        isHiddable: false,
        render: text => <span className={`mcs-campaigns-status-${text.toLowerCase()}`}><FormattedMessage id={text} /></span>
      },
      {
        translationKey: 'NAME',
        key: 'name',
        isHiddable: false,
        render: (text, record) => <Link className="mcs-campaigns-link" to={`/${workspaceId}/campaigns/email/report/${record.id}/basic`}>{text}</Link>
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

    const statusItems = CampaignStatuses.map(status => ({ key: status, value: status }));

    const filtersOptions = [
      {
        name: 'status',
        displayElement: (<div><FormattedMessage id="STATUS" /> <Icon type="down" /></div>),
        menuItems: {
          handleMenuClick: value => {
            this.updateQueryParams({
              statuses: value.status.map(item => item.value)
            });
          },
          selectedItems: filter.statuses.map(status => ({ key: status, value: status })),
          items: statusItems
        }
      }
    ];

    const columnsDefinitions = {
      dataColumnsDefinition: dataColumns,
      actionsColumnsDefinition: actionColumns
    };

    return (<TableView
      columnsDefinitions={columnsDefinitions}
      dataSource={dataSource}
      loading={isFetchingCampaignsEmail}
      onChange={() => {}}
      searchOptions={searchOptions}
      dateRangePickerOptions={dateRangePickerOptions}
      filtersOptions={filtersOptions}
      columnsVisibilityOptions={columnsVisibilityOptions}
      pagination={pagination}
    />);

  }

  editCampaign(campaign) {
    const {
      activeWorkspace: {
        workspaceId
      },
      router
    } = this.props;

    router.push(`/${workspaceId}/campaigns/email/report/${campaign.id}/basic`);
  }

  archiveCampaign(campaign) {
    const {
      activeWorkspace: {
        organisationId
      },
      archiveCampaignEmail,
      loadCampaignsEmailDataSource,
      translations,
      query
    } = this.props;

    const filter = deserializeQuery(query, EMAIL_QUERY_SETTINGS);

    Modal.confirm({
      title: translations.CAMPAIGN_MODAL_CONFIRM_ARCHIVED_TITLE,
      content: translations.CAMPAIGN_MODAL_CONFIRM_ARCHIVED_BODY,
      iconType: 'exclamation-circle',
      okText: translations.MODAL_CONFIRM_ARCHIVED_OK,
      cancelText: translations.MODAL_CONFIRM_ARCHIVED_CANCEL,
      onOk() {
        return archiveCampaignEmail(campaign.id).then(() => {
          loadCampaignsEmailDataSource(organisationId, filter);
        });
      },
      onCancel() { },
    });
  }

}

CampaignsEmailTable.defaultProps = {
  archiveCampaignEmail: () => {}
};

CampaignsEmailTable.propTypes = {
  router: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  activeWorkspace: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  translations: PropTypes.objectOf(PropTypes.string).isRequired,
  query: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types

  isFetchingCampaignsEmail: PropTypes.bool.isRequired,
  isFetchingCampaignsStat: PropTypes.bool.isRequired,
  dataSource: PropTypes.arrayOf(PropTypes.object).isRequired,
  totalCampaignsEmail: PropTypes.number.isRequired,

  loadCampaignsEmailDataSource: PropTypes.func.isRequired,
  archiveCampaignEmail: PropTypes.func,
  resetCampaignsEmailTable: PropTypes.func.isRequired,
};

const mapStateToProps = (state, ownProps) => ({
  activeWorkspace: state.sessionState.activeWorkspace,
  query: ownProps.router.location.query,
  translations: state.translationsState.translations,

  isFetchingCampaignsEmail: state.campaignsEmailTable.campaignsEmailApi.isFetching,
  isFetchingCampaignsStat: state.campaignsEmailTable.deliveryReportApi.isFetching,
  dataSource: getTableDataSource(state),
  totalCampaignsEmail: state.campaignsEmailTable.campaignsEmailApi.total,
});

const mapDispatchToProps = {
  loadCampaignsEmailDataSource: CampaignsEmailActions.loadCampaignsEmailDataSource,
  // archiveCampaignEmail: CampaignEmailAction.archiveCampaignEmail,
  resetCampaignsEmailTable: CampaignsEmailActions.resetCampaignsEmailTable,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CampaignsEmailTable);
