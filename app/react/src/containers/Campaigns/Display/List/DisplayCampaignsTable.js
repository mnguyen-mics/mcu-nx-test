import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { Link, withRouter } from 'react-router-dom';
import { Icon, Modal, Tooltip } from 'antd';
import { FormattedMessage } from 'react-intl';

import {
  EmptyTableView,
  TableViewFilters,
} from '../../../../components/TableView/index.ts';
import McsIcons from '../../../../components/McsIcons.tsx';

import * as DisplayCampaignsActions from '../../../../state/Campaigns/Display/actions';
import DisplayCampaignsService from '../../../../services/DisplayCampaignService.ts';

import { DISPLAY_SEARCH_SETTINGS } from './constants';

import {
  buildDefaultSearch,
  compareSearches,
  isSearchValid,
  parseSearch,
  updateSearch,
} from '../../../../utils/LocationSearchHelper';

import { formatMetric } from '../../../../utils/MetricHelper.ts';
import { campaignStatuses } from '../../constants';
import messages from '../messages';
import { getTableDataSource } from '../../../../state/Campaigns/Display/selectors';

class DisplayCampaignsTable extends Component {
  componentDidMount() {
    const {
      history,
      location: { search, pathname },
      match: { params: { organisationId } },
      loadDisplayCampaignsDataSource,
    } = this.props;

    if (!isSearchValid(search, DISPLAY_SEARCH_SETTINGS)) {
      history.replace({
        pathname: pathname,
        search: buildDefaultSearch(search, DISPLAY_SEARCH_SETTINGS),
        state: { reloadDataSource: true },
      });
    } else {
      const filter = parseSearch(search, DISPLAY_SEARCH_SETTINGS);
      loadDisplayCampaignsDataSource(organisationId, filter, true);
    }
  }

  componentWillReceiveProps(nextProps) {
    const {
      location: { search },
      match: { params: { organisationId } },
      history,
      loadDisplayCampaignsDataSource,
    } = this.props;

    const {
      location: { pathname: nextPathname, search: nextSearch, state },
      match: { params: { organisationId: nextOrganisationId } },
    } = nextProps;

    const checkEmptyDataSource = state && state.reloadDataSource;

    if (
      !compareSearches(search, nextSearch) ||
      organisationId !== nextOrganisationId
    ) {
      if (!isSearchValid(nextSearch, DISPLAY_SEARCH_SETTINGS)) {
        history.replace({
          pathname: nextPathname,
          search: buildDefaultSearch(nextSearch, DISPLAY_SEARCH_SETTINGS),
          state: { reloadDataSource: organisationId !== nextOrganisationId },
        });
      } else {
        const filter = parseSearch(nextSearch, DISPLAY_SEARCH_SETTINGS);
        loadDisplayCampaignsDataSource(
          nextOrganisationId,
          filter,
          checkEmptyDataSource,
        );
      }
    }
  }

  componentWillUnmount() {
    this.props.resetDisplayCampaignsTable();
  }

  archiveCampaign = campaign => {
    const {
      match: { params: { organisationId } },
      location: { pathname, state, search },
      loadDisplayCampaignsDataSource,
      history,
      dataSource,
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
        return DisplayCampaignsService.deleteCampaign(campaign.id).then(() => {
          if (dataSource.length === 1 && filter.currentPage !== 1) {
            const newFilter = {
              ...filter,
              currentPage: filter.currentPage - 1,
            };
            loadDisplayCampaignsDataSource(organisationId, filter);
            history.replace({
              pathname: pathname,
              search: updateSearch(search, newFilter),
              state: state,
            });
          } else {
            loadDisplayCampaignsDataSource(organisationId, filter);
          }
        });
      },
      onCancel() {},
    });
  };

  editCampaign = (campaign) => {
    const {
      match: {
        params: {
          organisationId,
        },
      },
      location,
      history,
    } = this.props;

    const editUrl = `/v2/o/${organisationId}/campaigns/display/${
      campaign.id
    }/edit`;

    history.push({ pathname: editUrl, state: { from: `${location.pathname}${location.search}` } });
  };

  duplicateCampaign = (campaign) => {
    const {
      match: {
        params: {
          organisationId,
        },
      },
      history,
    } = this.props;

    const editUrl = `/v2/o/${organisationId}/campaigns/display/create`;

    history.push({ pathname: editUrl, state: { campaignId: campaign.id } });
  }

  updateLocationSearch = (params) => {
    const {
      history,
      location: { search: currentSearch, pathname },
    } = this.props;

    const nextLocation = {
      pathname,
      search: updateSearch(currentSearch, params, DISPLAY_SEARCH_SETTINGS),
    };
    history.push(nextLocation);
  };

  render() {
    const {
      match: { params: { organisationId } },
      location: { search },
      hasDisplayCampaigns,
      translations,
      isFetchingDisplayCampaigns,
      isFetchingCampaignsStat,
      dataSource,
      totalDisplayCampaigns,
      labels
    } = this.props;

    const filter = parseSearch(search, DISPLAY_SEARCH_SETTINGS);

    const searchOptions = {
      placeholder: translations.SEARCH_DISPLAY_CAMPAIGNS,
      onSearch: value =>
        this.updateLocationSearch({
          keywords: value,
        }),
      defaultValue: filter.keywords,
    };

    const dateRangePickerOptions = {
      isEnabled: true,
      onChange: values =>
        this.updateLocationSearch({
          from: values.from,
          to: values.to,
        }),
      values: {
        from: filter.from,
        to: filter.to,
      },
    };

    const columnsVisibilityOptions = {
      isEnabled: true,
    };

    const pagination = {
      current: filter.currentPage,
      pageSize: filter.pageSize,
      total: totalDisplayCampaigns,
      onChange: page =>
        this.updateLocationSearch({
          currentPage: page,
        }),
      onShowSizeChange: (current, size) =>
        this.updateLocationSearch({
          currentPage: 1,
          pageSize: size,
        }),
    };

    const renderMetricData = (value, numeralFormat, currency = '') => {
      if (isFetchingCampaignsStat) {
        return <i className="mcs-table-cell-loading" />; // (<span>loading...</span>);
      }
      switch (currency) {
        case 'EUR': {
          const unlocalizedMoneyPrefix = '€ ';
          return formatMetric(value, numeralFormat, unlocalizedMoneyPrefix);
        }
        default: {
          const unlocalizedMoneyPrefix = '';
          return formatMetric(value, numeralFormat, unlocalizedMoneyPrefix);
        }
      }
    };

    const dataColumns = [
      {
        translationKey: 'STATUS',
        key: 'status',
        isHideable: false,
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
        isHideable: false,
        render: (text, record) => (
          <Link
            className="mcs-campaigns-link"
            to={`/v2/o/${organisationId}/campaigns/display/${record.id}`}
          >
            {text}
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
        translationKey: 'IMPRESSIONS_COST',
        key: 'impressions_cost',
        isVisibleByDefault: true,
        isHideable: true,
        render: text => {
          // TODO find campaign currency (with getDisplayCampaignsById(record['campaign_id']))
          const campaignCurrency = 'EUR';
          return renderMetricData(text, '0,0.00', campaignCurrency);
        },
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
        render: text => renderMetricData(parseFloat(text) / 100, '0.000%'),
      },
      {
        translationKey: 'CPC',
        key: 'cpc',
        isVisibleByDefault: true,
        isHideable: true,
        render: text => renderMetricData(text, '0,0.00', 'EUR'),
      },
      // TODO UNCOMMENT WHEN THE CPA IS FIXED ON BACKEND SIDE
      // {
      //   translationKey: 'CPA',
      //   key: 'cpa',
      //   isVisibleByDefault: true,
      //   isHideable: true,
      //   render: text => renderMetricData(text, '0,0.00', 'EUR'),
      // },
    ];

    const actionColumns = [
      {
        key: 'action',
        actions: [
          {
            translationKey: 'EDIT',
            callback: this.editCampaign,
          },
          {
            intlMessage: messages.duplication,
            callback: this.duplicateCampaign,
          },
          {
            translationKey: 'ARCHIVE',
            callback: this.archiveCampaign,
          },
        ],
      },
    ];

    const statusItems = campaignStatuses.map(status => ({
      key: status,
      value: status,
    }));

    const filtersOptions = [
      {
        displayElement: (
          <div>
            <FormattedMessage id="STATUS" /> <Icon type="down" />
          </div>
        ),
        selectedItems: filter.statuses.map(status => ({
          key: status,
          value: status,
        })),
        items: statusItems,
        getKey: item => item.key,
        display: item => item.value,
        handleMenuClick: values =>
          this.updateLocationSearch({
            statuses: values.map(v => v.value),
          }),
      },
    ];

    const labelsOptions = {
      labels: this.props.labels,
      selectedLabels: labels.filter(label => {
        return filter.label_id.find(filteredLabelId => filteredLabelId === label.id) ? true : false;
      }),
      onChange: (newLabels) => {
        const formattedLabels = newLabels.map(label => label.id);
        this.updateLocationSearch({ label_id: formattedLabels });
      },
      buttonMessage: messages.filterByLabel
    };

    return (hasDisplayCampaigns
      ? (
        <div className="mcs-table-container">
          <TableViewFilters
            columns={dataColumns}
            actionsColumnsDefinition={actionColumns}
            searchOptions={searchOptions}
            dateRangePickerOptions={dateRangePickerOptions}
            filtersOptions={filtersOptions}
            columnsVisibilityOptions={columnsVisibilityOptions}
            dataSource={dataSource}
            loading={isFetchingDisplayCampaigns}
            pagination={pagination}
            labelsOptions={labelsOptions}
          />
        </div>
    )
    : <EmptyTableView iconType="display" text="EMPTY_DISPLAY" />
    );
  }
}

DisplayCampaignsTable.propTypes = {
  match: PropTypes.shape().isRequired,
  location: PropTypes.shape().isRequired,
  history: PropTypes.shape().isRequired,
  translations: PropTypes.objectOf(PropTypes.string).isRequired,

  hasDisplayCampaigns: PropTypes.bool.isRequired,
  isFetchingDisplayCampaigns: PropTypes.bool.isRequired,
  isFetchingCampaignsStat: PropTypes.bool.isRequired,
  dataSource: PropTypes.arrayOf(PropTypes.object).isRequired,
  totalDisplayCampaigns: PropTypes.number.isRequired,
  labels: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  loadDisplayCampaignsDataSource: PropTypes.func.isRequired,
  resetDisplayCampaignsTable: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  labels: state.labels.labelsApi.data,
  translations: state.translations,
  hasDisplayCampaigns: state.displayCampaignsTable.displayCampaignsApi.hasItems,
  isFetchingDisplayCampaigns:
    state.displayCampaignsTable.displayCampaignsApi.isFetching,
  isFetchingCampaignsStat:
    state.displayCampaignsTable.performanceReportApi.isFetching,
  dataSource: getTableDataSource(state),
  totalDisplayCampaigns: state.displayCampaignsTable.displayCampaignsApi.total,
});

const mapDispatchToProps = {
  loadDisplayCampaignsDataSource:
    DisplayCampaignsActions.loadDisplayCampaignsDataSource,
  resetDisplayCampaignsTable:
    DisplayCampaignsActions.resetDisplayCampaignsTable,
};

export default compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps),
)(DisplayCampaignsTable);
