import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import lodash from 'lodash';
import Link from 'react-router/lib/Link';
import { Icon, Modal, Spin } from 'antd';
import { FormattedMessage } from 'react-intl';

import { TableView } from '../../../components/TableView';

import * as CampaignsDisplayActions from '../../../state/Campaigns/Display/actions';

import {
  DISPLAY_QUERY_SETTINGS,

  updateQueryWithParams,
  deserializeQuery
} from '../RouteQuerySelector';

import { formatMetric } from '../../../utils/MetricHelper';
import { CampaignStatuses } from '../../../constants/CampaignConstant';

import {
  getTableDataSource
 } from '../../../state/Campaigns/Display/selectors';

class CampaignsDisplayTable extends Component {

  constructor(props) {
    super(props);
    this.updateQueryParams = this.updateQueryParams.bind(this);
    this.archiveCampaign = this.archiveCampaign.bind(this);
    this.editCampaign = this.editCampaign.bind(this);
  }

  componentDidMount() {
    const {
      query,

      fetchCampaignsAndStatistics
    } = this.props;

    const filter = deserializeQuery(query, DISPLAY_QUERY_SETTINGS);
    fetchCampaignsAndStatistics(filter);
  }

  componentWillReceiveProps(nextProps) {
    const {
      query,
      activeWorkspace: {
        workspaceId
      },

      fetchCampaignsAndStatistics
    } = this.props;

    const {
      query: nextQuery,
      activeWorkspace: {
        workspaceId: nextWorkspaceId
      },
    } = nextProps;

    if (!lodash.isEqual(query, nextQuery) || workspaceId !== nextWorkspaceId) {
      const filter = deserializeQuery(nextQuery, DISPLAY_QUERY_SETTINGS);
      fetchCampaignsAndStatistics(filter);
    }
  }

  componentWillUnmount() {
    this.props.resetCampaignsDisplayTable();
  }

  updateQueryParams(params) {
    const {
      router,
      query: currentQuery
    } = this.props;

    const location = router.getCurrentLocation();
    router.replace({
      pathname: location.pathname,
      query: updateQueryWithParams(currentQuery, params, DISPLAY_QUERY_SETTINGS)
    });
  }

  render() {
    const {
      query,
      activeWorkspace: {
        workspaceId
      },
      translations,
      isFetchingCampaignsDisplay,
      isFetchingCampaignsStat,
      dataSource,
      totalCampaignsDisplay
    } = this.props;

    const filter = deserializeQuery(query, DISPLAY_QUERY_SETTINGS);

    const searchOptions = {
      isEnabled: true,
      placeholder: translations.SEARCH_CAMPAIGNS_DISPLAY,
      onSearch: value => this.updateQueryParams({
        keywords: value
      }),
      defaultValue: filter.keywords
    };

    const dateRangePickerOptions = {
      isEnabled: true,
      onChange: (dates) => this.updateQueryParams({
        from: dates[0],
        to: dates[1]
      }),
      from: filter.from,
      to: filter.to
    };

    const columnsVisibilityOptions = {
      isEnabled: true
    };

    const pagination = {
      currentPage: filter.currentPage,
      pageSize: filter.pageSize,
      total: totalCampaignsDisplay,
      onChange: (page) => this.updateQueryParams({
        currentPage: page
      }),
      onShowSizeChange: (current, size) => this.updateQueryParams({
        pageSize: size
      })
    };

    const renderMetricData = (value, numeralFormat, currency = '') => {
      if (isFetchingCampaignsStat) {
        return (<Spin size="small" />); // (<span>loading...</span>);
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
        render: (text, record) => <Link className="mcs-campaigns-link" to={`/${workspaceId}/campaigns/display/report/${record.id}/basic`}>{text}</Link>
      },
      {
        translationKey: 'IMPRESSIONS',
        key: 'impressions',
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
        translationKey: 'IMPRESSIONS_COST',
        key: 'impressions_cost',
        isVisibleByDefault: true,
        isHiddable: true,
        render: (text, record) => {
          // TODO find campaign (with getCampaignsDisplayById(record['campaign_id']))
          const campaignCurrency = 'EUR';
          return renderMetricData(text, '0,0.00', campaignCurrency);
        }
      },
      {
        translationKey: 'CPM',
        key: 'cpm',
        isVisibleByDefault: true,
        isHiddable: true,
        render: text => renderMetricData(text, '0,0.00', 'EUR')
      },
      {
        translationKey: 'CTR',
        key: 'ctr',
        isVisibleByDefault: true,
        isHiddable: true,
        render: text => renderMetricData(text, '0,00 %')
      },
      {
        translationKey: 'CPC',
        key: 'cpc',
        isVisibleByDefault: true,
        isHiddable: true,
        render: text => renderMetricData(text, '0,0.00', 'EUR')
      },
      {
        translationKey: 'CPA',
        key: 'cpa',
        isVisibleByDefault: true,
        isHiddable: true,
        render: text => renderMetricData(text, '0,0.00', 'EUR')
      }
    ];

    const actionColumns = [
      {
        key: 'action',
        actions: [
          {
            translationKey: 'ARCHIVE',
            callback: this.archiveCampaign
          },
          {
            translationKey: 'EDIT',
            callback: this.editCampaign
          }
        ]
      }
    ];

    const statusItems = CampaignStatuses.map(status => ({ key: status, value: status }));

    // lodash.debounce(plop, 1000)
    // const plop = value => {
    //   console.log('plop');
    //   return this.updateQueryParams({
    //     statuses: value.status.map(item => item.value)
    //   });
    // };

    const filtersOptions = [
      {
        name: 'status',
        displayElement: (<div><FormattedMessage id="STATUS" /><Icon type="down" /></div>),
        menuItems: {
          handleMenuClick: value => this.updateQueryParams({ statuses: value.status.map(item => item.value) }),
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
      loading={isFetchingCampaignsDisplay}
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

    let editUrl;
    switch (campaign.editor_artifact_id) {
      case 'default-editor':
        editUrl = `/${workspaceId}/campaigns/display/expert/edit/${campaign.id}`;
        break;
      case 'external-campaign-editor':
        editUrl = `/${workspaceId}/campaigns/display/external/edit/${campaign.id}`;
        break;
      case 'keywords-targeting-editor':
        editUrl = `/${workspaceId}/campaigns/display/keywords/${campaign.id}`;
        break;
      default:
        break;
    }

    router.push(editUrl);
  }

  archiveCampaign(campaign) {
    const {
      archiveCampaignDisplay,
      fetchCampaignsAndStatistics,
      translations,
      query
    } = this.props;

    const filter = deserializeQuery(query, DISPLAY_QUERY_SETTINGS);

    Modal.confirm({
      title: translations.CAMPAIGN_MODAL_CONFIRM_ARCHIVED_TITLE,
      content: translations.CAMPAIGN_MODAL_CONFIRM_ARCHIVED_BODY,
      iconType: 'exclamation-circle',
      okText: translations.MODAL_CONFIRM_ARCHIVED_OK,
      cancelText: translations.MODAL_CONFIRM_ARCHIVED_CANCEL,
      onOk() {
        return archiveCampaignDisplay(campaign.id).then(() => {
          fetchCampaignsAndStatistics(filter);
        });
      },
      onCancel() { },
    });
  }

}

CampaignsDisplayTable.defaultProps = {
  archiveCampaignDisplay: () => { }
};

CampaignsDisplayTable.propTypes = {
  router: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  activeWorkspace: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  translations: PropTypes.objectOf(PropTypes.string).isRequired,
  query: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types

  isFetchingCampaignsDisplay: PropTypes.bool.isRequired,
  isFetchingCampaignsStat: PropTypes.bool.isRequired,
  dataSource: PropTypes.arrayOf(PropTypes.object).isRequired,
  totalCampaignsDisplay: PropTypes.number.isRequired,

  fetchCampaignsAndStatistics: PropTypes.func.isRequired,
  archiveCampaignDisplay: PropTypes.func.isRequired,
  resetCampaignsDisplayTable: PropTypes.func.isRequired,
};

const mapStateToProps = (state, ownProps) => ({
  activeWorkspace: state.sessionState.activeWorkspace,
  query: ownProps.router.location.query,
  translations: state.translationsState.translations,

  isFetchingCampaignsDisplay: state.campaignsDisplayTable.campaignsDisplayApi.isFetching,
  isFetchingCampaignsStat: state.campaignsDisplayTable.performanceReportApi.isFetching,
  dataSource: getTableDataSource(state),
  totalCampaignsDisplay: state.campaignsDisplayTable.campaignsDisplayApi.total,
});

const mapDispatchToProps = {
  fetchCampaignsAndStatistics: CampaignsDisplayActions.fetchCampaignsAndStatistics,
  // archiveCampaignDisplay: CampaignEmailAction.archiveCampaignDisplay,
  resetCampaignsDisplayTable: CampaignsDisplayActions.resetCampaignsDisplayTable
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CampaignsDisplayTable);
