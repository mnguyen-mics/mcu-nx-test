import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';
import { Modal, Tooltip, Icon } from 'antd';
import { FormattedMessage } from 'react-intl';

import {
  TableView,
  TableViewFilters,
  EmptyTableView,
} from '../../../../components/TableView';
import { McsIcons } from '../../../../components/McsIcons';

import * as CampaignsDisplayActions from '../../../../state/Campaigns/Display/actions';

import { DISPLAY_SEARCH_SETTINGS } from './constants';

import {
  updateSearch,
  parseSearch,
  isSearchValid,
  buildDefaultSearch,
  compareSearchs,
} from '../../../../utils/LocationSearchHelper';

import { formatMetric } from '../../../../utils/MetricHelper';
import { campaignStatuses } from '../../constants';

import {
  getTableDataSource,
} from '../../../../state/Campaigns/Display/selectors';

class CampaignsDisplayTable extends Component {

  componentDidMount() {
    const {
      history,
      location: {
        search,
        pathname,
      },
      match: {
        params: {
          organisationId,
        },
      },
      loadCampaignsDisplayDataSource,
    } = this.props;
    if (!isSearchValid(search, DISPLAY_SEARCH_SETTINGS)) {
      history.replace({
        pathname: pathname,
        search: buildDefaultSearch(search, DISPLAY_SEARCH_SETTINGS),
        state: { reloadDataSource: true },
      });
    } else {
      const filter = parseSearch(search, DISPLAY_SEARCH_SETTINGS);
      loadCampaignsDisplayDataSource(organisationId, filter, true);
    }
  }

  componentWillReceiveProps(nextProps) {
    const {
      location: {
        search,
      },
      match: {
        params: {
          organisationId,
        },
      },
      history,
      loadCampaignsDisplayDataSource,
    } = this.props;

    const {
      location: {
        pathname: nextPathname,
        search: nextSearch,
        state,
      },
      match: {
        params: {
          organisationId: nextOrganisationId,
        },
      },
    } = nextProps;

    const checkEmptyDataSource = state && state.reloadDataSource;

    if (!compareSearchs(search, nextSearch) || organisationId !== nextOrganisationId) {
      if (!isSearchValid(nextSearch, DISPLAY_SEARCH_SETTINGS)) {
        history.replace({
          pathname: nextPathname,
          search: buildDefaultSearch(nextSearch, DISPLAY_SEARCH_SETTINGS),
          state: { reloadDataSource: organisationId !== nextOrganisationId },
        });
      } else {
        const filter = parseSearch(nextSearch, DISPLAY_SEARCH_SETTINGS);
        loadCampaignsDisplayDataSource(nextOrganisationId, filter, checkEmptyDataSource);
      }
    }
  }

  componentWillUnmount() {
    this.props.resetCampaignsDisplayTable();
  }

  archiveCampaign = (campaign) => {
    const {
      match: {
        params: {
          organisationId,
        },
      },
      location: {
        search,
      },
      archiveCampaignDisplay,
      loadCampaignsDisplayDataSource,
      translations,
    } = this.props;

    const filter = parseSearch(search, DISPLAY_SEARCH_SETTINGS);

    Modal.confirm({
      title: translations.CAMPAIGN_MODAL_CONFIRM_ARCHIVED_TITLE,
      content: translations.CAMPAIGN_MODAL_CONFIRM_ARCHIVED_BODY,
      iconType: 'exclamation-circle',
      okText: translations.MODAL_CONFIRM_ARCHIVED_OK,
      cancelText: translations.MODAL_CONFIRM_ARCHIVED_CANCEL,
      onOk() {
        return archiveCampaignDisplay(campaign.id).then(() => {
          loadCampaignsDisplayDataSource(organisationId, filter);
        });
      },
      onCancel() { },
    });
  }

  editCampaign = (campaign) => {
    const {
      match: {
        params: {
          organisationId,
        },
      },
      history,
    } = this.props;

    let editUrl;
    switch (campaign.editor_artifact_id) {
      case 'default-editor':
        editUrl = `/${organisationId}/campaigns/display/expert/edit/${campaign.id}`;
        break;
      case 'external-campaign-editor':
        editUrl = `/${organisationId}/campaigns/display/external/edit/${campaign.id}`;
        break;
      case 'keywords-targeting-editor':
        editUrl = `/${organisationId}/campaigns/display/keywords/${campaign.id}`;
        break;
      default:
        break;
    }

    history.push(editUrl);
  }

  updateLocationSearch = (params) => {
    const {
      history,
      location: {
        search: currentSearch,
        pathname,
      },
    } = this.props;

    const nextLocation = {
      pathname,
      search: updateSearch(currentSearch, params, DISPLAY_SEARCH_SETTINGS),
    };

    history.push(nextLocation);
  }

  render() {
    const {
      match: {
        params: {
          organisationId,
        },
      },
      location: {
        search,
      },
      hasDisplayCampaigns,
      translations,
      isFetchingCampaignsDisplay,
      isFetchingCampaignsStat,
      dataSource,
      totalCampaignsDisplay,
    } = this.props;

    const filter = parseSearch(search, DISPLAY_SEARCH_SETTINGS);

    const searchOptions = {
      isEnabled: true,
      placeholder: translations.SEARCH_CAMPAIGNS_DISPLAY,
      onSearch: value => this.updateLocationSearch({
        keywords: value,
      }),
      defaultValue: filter.keywords,
    };

    const dateRangePickerOptions = {
      isEnabled: true,
      onChange: (values) => this.updateLocationSearch({
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
      total: totalCampaignsDisplay,
      onChange: (page) => this.updateLocationSearch({
        currentPage: page,
      }),
      onShowSizeChange: (current, size) => this.updateLocationSearch({
        pageSize: size,
      }),
    };

    const renderMetricData = (value, numeralFormat, currency = '') => {
      if (isFetchingCampaignsStat) {
        return (<i className="mcs-table-cell-loading" />); // (<span>loading...</span>);
      }
      const unlocalizedMoneyPrefix = currency === 'EUR' ? '€ ' : '';
      return formatMetric(value, numeralFormat, unlocalizedMoneyPrefix);
    };

    const dataColumns = [
      {
        translationKey: 'STATUS',
        key: 'status',
        isHiddable: false,
        render: text => (
          <Tooltip placement="top" title={translations[text]}>
            <span className={`mcs-campaigns-status-${text.toLowerCase()}`}>
              <McsIcons type="status" />
            </span>
          </Tooltip>
        ),
      },
      {
        translationKey: 'NAME',
        key: 'name',
        isHiddable: false,
        render: (text, record) => (
          <Link
            className="mcs-campaigns-link"
            to={`/v2/o/${organisationId}/campaigns/display/${record.id}`}
          >{text}
          </Link>
        ),
      },
      {
        translationKey: 'IMPRESSIONS',
        key: 'impressions',
        isVisibleByDefault: true,
        isHiddable: true,
        render: text => renderMetricData(text, '0,0'),
      },
      {
        translationKey: 'CLICKS',
        key: 'clicks',
        isVisibleByDefault: true,
        isHiddable: true,
        render: text => renderMetricData(text, '0,0'),
      },
      {
        translationKey: 'IMPRESSIONS_COST',
        key: 'impressions_cost',
        isVisibleByDefault: true,
        isHiddable: true,
        render: (text) => {
          // TODO find campaign currency (with getCampaignsDisplayById(record['campaign_id']))
          const campaignCurrency = 'EUR';
          return renderMetricData(text, '0,0.00', campaignCurrency);
        },
      },
      {
        translationKey: 'CPM',
        key: 'cpm',
        isVisibleByDefault: true,
        isHiddable: true,
        render: text => renderMetricData(text, '0,0.00', 'EUR'),
      },
      {
        translationKey: 'CTR',
        key: 'ctr',
        isVisibleByDefault: true,
        isHiddable: true,
        render: text => renderMetricData(text, '0,00 %'),
      },
      {
        translationKey: 'CPC',
        key: 'cpc',
        isVisibleByDefault: true,
        isHiddable: true,
        render: text => renderMetricData(text, '0,0.00', 'EUR'),
      },
      {
        translationKey: 'CPA',
        key: 'cpa',
        isVisibleByDefault: true,
        isHiddable: true,
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

    const statusItems = campaignStatuses.map(status => ({ key: status, value: status }));

    const filtersOptions = [
      {
        name: 'status',
        displayElement: (<div><FormattedMessage id="STATUS" /> <Icon type="down" /></div>),
        menuItems: {
          handleMenuClick: value => this.updateLocationSearch({
            statuses: value.status.map(item => item.value),
          }),
          selectedItems: filter.statuses.map(status => ({ key: status, value: status })),
          items: statusItems,
        },
      },
    ];

    const columnsDefinitions = {
      dataColumnsDefinition: dataColumns,
      actionsColumnsDefinition: actionColumns,
    };

    return (hasDisplayCampaigns
      ? (
        <div className="mcs-table-container">
          <TableViewFilters
            columnsDefinitions={columnsDefinitions}
            searchOptions={searchOptions}
            dateRangePickerOptions={dateRangePickerOptions}
            filtersOptions={filtersOptions}
            columnsVisibilityOptions={columnsVisibilityOptions}
          >
            <TableView
              columnsDefinitions={columnsDefinitions}
              dataSource={dataSource}
              loading={isFetchingCampaignsDisplay}
              pagination={pagination}
            />
          </TableViewFilters>
        </div>
    )
    : <EmptyTableView iconType="display" text="EMPTY_DISPLAY" />
    );
  }
}

CampaignsDisplayTable.defaultProps = {
  archiveCampaignDisplay: () => { },
};

CampaignsDisplayTable.propTypes = {
  match: PropTypes.shape().isRequired,
  location: PropTypes.shape().isRequired,
  history: PropTypes.shape().isRequired,
  translations: PropTypes.objectOf(PropTypes.string).isRequired,

  hasDisplayCampaigns: PropTypes.bool.isRequired,
  isFetchingCampaignsDisplay: PropTypes.bool.isRequired,
  isFetchingCampaignsStat: PropTypes.bool.isRequired,
  dataSource: PropTypes.arrayOf(PropTypes.object).isRequired,
  totalCampaignsDisplay: PropTypes.number.isRequired,

  loadCampaignsDisplayDataSource: PropTypes.func.isRequired,
  archiveCampaignDisplay: PropTypes.func.isRequired,
  resetCampaignsDisplayTable: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  translations: state.translations,

  hasDisplayCampaigns: state.campaignsDisplayTable.campaignsDisplayApi.hasItems,
  isFetchingCampaignsDisplay: state.campaignsDisplayTable.campaignsDisplayApi.isFetching,
  isFetchingCampaignsStat: state.campaignsDisplayTable.performanceReportApi.isFetching,
  dataSource: getTableDataSource(state),
  totalCampaignsDisplay: state.campaignsDisplayTable.campaignsDisplayApi.total,
});

const mapDispatchToProps = {
  loadCampaignsDisplayDataSource: CampaignsDisplayActions.loadCampaignsDisplayDataSource,
  // archiveCampaignDisplay: CampaignEmailAction.archiveCampaignDisplay,
  resetCampaignsDisplayTable: CampaignsDisplayActions.resetCampaignsDisplayTable,
};

CampaignsDisplayTable = connect(
  mapStateToProps,
  mapDispatchToProps,
)(CampaignsDisplayTable);

CampaignsDisplayTable = withRouter(CampaignsDisplayTable);

export default CampaignsDisplayTable;
