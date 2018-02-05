import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { Link, withRouter } from 'react-router-dom';
import { Icon, Modal, Tooltip } from 'antd';
import {
  FormattedMessage,
  InjectedIntlProps,
  defineMessages,
  injectIntl,
} from 'react-intl';

import {
  EmptyTableView,
  TableViewFilters,
} from '../../../../components/TableView/index';
import McsIcon from '../../../../components/McsIcon';

import * as DisplayCampaignsActions from '../../../../state/Campaigns/Display/actions';
import DisplayCampaignsService from '../../../../services/DisplayCampaignService';

import { DISPLAY_SEARCH_SETTINGS } from './constants';

import {
  buildDefaultSearch,
  compareSearches,
  isSearchValid,
  parseSearch,
  updateSearch,
} from '../../../../utils/LocationSearchHelper';

import { formatMetric } from '../../../../utils/MetricHelper';
import { campaignStatuses } from '../../constants';
import messages from '../messages';
import { getTableDataSource } from '../../../../state/Campaigns/Display/selectors';
import { CampaignStatus } from '../../../../models/campaign/constants/index';
import { UpdateMessage } from '../Dashboard/Campaign/DisplayCampaignAdGroupTable';
import { RouteComponentProps } from 'react-router';
import { FilterProps } from './DisplayCampaignsActionbar';
import { TranslationProps } from '../../../Helpers/withTranslations';
import { withTranslations } from '../../../Helpers/index';
import { DisplayCampaignResource } from '../../../../models/campaign/display/DisplayCampaignResource';
import { McsDateRangeValue } from '../../../../components/McsDateRangePicker';
import { Label } from '../../../Labels/Labels';

const messageMap = defineMessages({
  notificationSuccess: {
    id: 'notification.success.title',
    defaultMessage: 'Success',
  },
  notificationError: {
    id: 'notification.success.error',
    defaultMessage: 'Error',
  },
  notificationCampaignActivationSuccess: {
    id: 'display.notifications.campaign.activation.success',
    defaultMessage: 'Campaign {name} successfully activated',
  },
  notificationCampaignActivationError: {
    id: 'display.notifications.campaign.activation.error',
    defaultMessage:
      'There was an error activating campaign {name}... Please try again...',
  },
  notificationCampaignPauseSuccess: {
    id: 'display.notifications.campaign.pause.success',
    defaultMessage: 'Campaign {name} successfully paused',
  },
  notificationCampaignPauseError: {
    id: 'display.notifications.campaign.pause.error',
    defaultMessage:
      'There was an error pausing campaign {name}... Please try again...',
  },
});

interface DisplayCampaignsTableProps {
  rowSelection: {
    selectedRowKeys: string[];
    onChange: (selectedRowKeys: string[]) => void;
    selectAllItemIds: () => void;
    unselectAllItemIds: () => void;
    onSelectAll: () => void;
  };
  updateCampaignStatus: (
    campaignId: string,
    body: { status: CampaignStatus },
    successMessage?: UpdateMessage,
    errorMessage?: UpdateMessage,
    undoBody?: { status: CampaignStatus },
  ) => void;
}

interface MapDispatchToProps {
  labels: Label[];
  translations: TranslationProps;
  hasDisplayCampaigns: boolean;
  isFetchingDisplayCampaigns: boolean;
  isFetchingCampaignsStat: boolean;
  dataSource: DisplayCampaignResource[];
  totalDisplayCampaigns: number;
}

interface MapStateToProps {
  loadDisplayCampaignsDataSource: (
    organisationId: string,
    filer: FilterProps,
    bool?: boolean,
  ) => void;
  resetDisplayCampaignsTable: () => void;
}

type JoinedProps = DisplayCampaignsTableProps &
  InjectedIntlProps &
  MapDispatchToProps &
  MapStateToProps &
  TranslationProps &
  RouteComponentProps<{ organisationId: string }>;

class DisplayCampaignsTable extends React.Component<JoinedProps> {
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

  componentWillReceiveProps(nextProps: JoinedProps) {
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

  archiveCampaign = (campaign: DisplayCampaignResource) => {
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
      onCancel() {
        //
      },
    });
  };

  editCampaign = (campaign: DisplayCampaignResource) => {
    const {
      match: { params: { organisationId } },
      location,
      history,
    } = this.props;

    const editUrl = `/v2/o/${organisationId}/campaigns/display/${
      campaign.id
    }/edit`;

    history.push({
      pathname: editUrl,
      state: { from: `${location.pathname}${location.search}` },
    });
  };

  duplicateCampaign = (campaign: DisplayCampaignResource) => {
    const { match: { params: { organisationId } }, history } = this.props;

    const editUrl = `/v2/o/${organisationId}/campaigns/display/create`;

    history.push({ pathname: editUrl, state: { campaignId: campaign.id } });
  };

  updateLocationSearch = (params: any) => {
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

  changeCampaignStatus = (
    record: DisplayCampaignResource,
    checked: boolean,
  ) => {
    const { updateCampaignStatus, intl: { formatMessage } } = this.props;
    const status: CampaignStatus = checked ? 'ACTIVE' : 'PAUSED';
    const initialStatus = checked ? 'PAUSED' : 'ACTIVE';
    const successMessage = checked
      ? {
          title: formatMessage(messageMap.notificationSuccess),
          body: formatMessage(
            messageMap.notificationCampaignActivationSuccess,
            {
              name: record.name,
            },
          ),
        }
      : {
          title: formatMessage(messageMap.notificationSuccess),
          body: formatMessage(messageMap.notificationCampaignPauseSuccess, {
            name: record.name,
          }),
        };
    const errorMessage = checked
      ? {
          title: formatMessage(messageMap.notificationError),
          body: formatMessage(messageMap.notificationCampaignActivationError, {
            name: record.name,
          }),
        }
      : {
          title: formatMessage(messageMap.notificationError),
          body: formatMessage(messageMap.notificationCampaignPauseError, {
            name: record.name,
          }),
        };

    updateCampaignStatus(
      record.id,
      {
        status: status,
      },
      successMessage,
      errorMessage,
      {
        status: initialStatus,
      },
    );
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
      labels,
      rowSelection,
    } = this.props;

    const filter = parseSearch(search, DISPLAY_SEARCH_SETTINGS);

    const searchOptions = {
      placeholder: translations.SEARCH_DISPLAY_CAMPAIGNS,
      onSearch: (value: string) =>
        this.updateLocationSearch({
          keywords: value,
        }),
      defaultValue: filter.keywords,
    };

    const dateRangePickerOptions = {
      isEnabled: true,
      onChange: (values: McsDateRangeValue) =>
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
      onChange: (page: number) =>
        this.updateLocationSearch({
          currentPage: page,
        }),
      onShowSizeChange: (current: number, size: number) =>
        this.updateLocationSearch({
          currentPage: 1,
          pageSize: size,
        }),
    };

    const renderMetricData = (
      value: any,
      numeralFormat: string,
      currency = '',
    ) => {
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
        render: (text: string) => (
          <Tooltip placement="top" title={translations[text]}>
            <span className={`mcs-campaigns-status-${text.toLowerCase()}`}>
              <McsIcon type="status" />
            </span>
          </Tooltip>
        ),
      },
      {
        translationKey: 'NAME',
        key: 'name',
        isHideable: false,
        render: (text: string, record: DisplayCampaignResource) => (
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
        render: (text: any) => renderMetricData(text, '0,0'),
      },
      {
        translationKey: 'CLICKS',
        key: 'clicks',
        isVisibleByDefault: true,
        isHideable: true,
        render: (text: any) => renderMetricData(text, '0,0'),
      },
      {
        translationKey: 'IMPRESSIONS_COST',
        key: 'impressions_cost',
        isVisibleByDefault: true,
        isHideable: true,
        render: (text: any) => {
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
        render: (text: any) => renderMetricData(text, '0,0.00', 'EUR'),
      },
      {
        translationKey: 'CTR',
        key: 'ctr',
        isVisibleByDefault: true,
        isHideable: true,
        render: (text: any) =>
          renderMetricData(parseFloat(text) / 100, '0.000%'),
      },
      {
        translationKey: 'CPC',
        key: 'cpc',
        isVisibleByDefault: true,
        isHideable: true,
        render: (text: any) => renderMetricData(text, '0,0.00', 'EUR'),
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
        selectedItems: filter.statuses.map((status: CampaignStatus) => ({
          key: status,
          value: status,
        })),
        items: statusItems,
        getKey: (item: { key: CampaignStatus; value: CampaignStatus }) =>
          item.key,
        display: (item: { key: CampaignStatus; value: CampaignStatus }) =>
          item.value,
        handleMenuClick: (
          values: Array<{ key: CampaignStatus; value: CampaignStatus }>,
        ) =>
          this.updateLocationSearch({
            statuses: values.map(v => v.value),
          }),
      },
    ];

    const labelsOptions = {
      labels: this.props.labels,
      selectedLabels: labels.filter(label => {
        return filter.label_id.find(
          (filteredLabelId: any) => filteredLabelId === label.id,
        )
          ? true
          : false;
      }),
      onChange: (newLabels: Label[]) => {
        const formattedLabels = newLabels.map(label => label.id);
        this.updateLocationSearch({ label_id: formattedLabels });
      },
      buttonMessage: messages.filterByLabel,
    };

    return hasDisplayCampaigns ? (
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
          rowSelection={rowSelection}
        />
      </div>
    ) : (
      <EmptyTableView iconType="display" text="EMPTY_DISPLAY" />
    );
  }
}

const mapStateToProps = (state: any) => ({
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

export default compose<JoinedProps, DisplayCampaignsTableProps>(
  withRouter,
  withTranslations,
  injectIntl,
  connect(mapStateToProps, mapDispatchToProps),
)(DisplayCampaignsTable);
