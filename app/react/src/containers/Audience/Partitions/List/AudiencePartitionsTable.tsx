import * as React from 'react';
import { connect } from 'react-redux';
import { Link, withRouter, RouteComponentProps } from 'react-router-dom';
import { Modal, Icon } from 'antd';
import lodash from 'lodash';
import { compose } from 'recompose';

import {
  TableViewFilters,
} from '../../../../components/TableView/index';
import * as AudiencePartitionsActions from '../../../../state/Audience/Partitions/actions';
import { PARTITIONS_SEARCH_SETTINGS } from './constants';
import {
  updateSearch,
  parseSearch,
  isSearchValid,
  buildDefaultSearch,
  compareSearches,
} from '../../../../utils/LocationSearchHelper';
import { getTableDataSource } from '../../../../state/Audience/Partitions/selectors';
import { getWorkspace } from '../../../../state/Session/selectors';
import { TranslationProps } from '../../../Helpers/withTranslations';
import { withTranslations } from '../../../Helpers';
import McsMoment from '../../../../utils/McsMoment';
import { CampaignStatus } from '../../../../models/campaign/constants';
import { AudiencePartitionResource } from '../../../../models/audiencePartition/AudiencePartitionResource';
import { UserWorkspaceResource } from '../../../../models/directory/UserProfileResource';
import { FormattedMessage } from 'react-intl';
import { InjectedDatamartProps, injectDatamart } from '../../../Datamart';

interface FilterProps {
  currentPage: number;
  from: McsMoment;
  to: McsMoment;
  keywords: string;
  pageSize: number;
  statuses: CampaignStatus[];
}

interface MapStateToProps {
  isFetchingAudiencePartitions: boolean;
  dataSource: AudiencePartitionResource[];
  totalAudiencePartitions: number;
  hasAudiencePartitions: boolean;
  workspace: (organisationId: string) => UserWorkspaceResource;
}

interface MapDispatchToProps {
  loadAudiencePartitionsDataSource: (
    organisationId: string,
    datamartId: string,
    filter: FilterProps,
    bool?: boolean,
  ) => AudiencePartitionResource[];
  archiveAudiencePartition: (partitionId: string) => void;
  resetAudiencePartitionsTable: () => void;
}

interface State {
  datamartId?: string;
}

type Props = MapStateToProps &
  MapDispatchToProps &
  TranslationProps &
  InjectedDatamartProps &
  RouteComponentProps<{ organisationId: string }>;

class AudiencePartitionsTable extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.updateLocationSearch = this.updateLocationSearch.bind(this);
    this.archivePartition = this.archivePartition.bind(this);
    this.editPartition = this.editPartition.bind(this);
    this.state = {
      datamartId: undefined,
    };
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    const { datamartId: prevDatamartId } = prevState;
    const { datamartId } = this.state;
    if (datamartId !== prevDatamartId) {
      this.loadAudiencePartitionsData();
    }
  }

  loadAudiencePartitionsData = () => {
    const {
      location: { search },
      match: { params: { organisationId } },
      loadAudiencePartitionsDataSource,
      datamart,
    } = this.props;
    const filter = parseSearch(search, this.getSearchSetting(organisationId));
    const datamartId = this.state.datamartId
      ? this.state.datamartId
      : datamart.id;

    loadAudiencePartitionsDataSource(organisationId, datamartId, filter, true);
  };

  componentDidMount() {
    const {
      history,
      location: { search, pathname },
      match: { params: { organisationId } },
    } = this.props;

    if (!isSearchValid(search, this.getSearchSetting(organisationId))) {
      history.replace({
        pathname: pathname,
        search: buildDefaultSearch(
          search,
          this.getSearchSetting(organisationId),
        ),
        state: { reloadDataSource: true },
      });
    } else {
      this.loadAudiencePartitionsData();
    }
  }

  componentWillReceiveProps(nextProps: Props) {
    const {
      location: { search },
      match: { params: { organisationId } },
      history,
      loadAudiencePartitionsDataSource,
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
      if (
        !isSearchValid(nextSearch, this.getSearchSetting(nextOrganisationId))
      ) {
        history.replace({
          pathname: nextPathname,
          search: buildDefaultSearch(
            nextSearch,
            this.getSearchSetting(nextOrganisationId),
          ),
          state: { reloadDataSource: organisationId !== nextOrganisationId },
        });
      } else {
        const filter = parseSearch(
          nextSearch,
          this.getSearchSetting(nextOrganisationId),
        );
        const datamartId = filter.datamarts[0];

        loadAudiencePartitionsDataSource(
          nextOrganisationId,
          datamartId,
          filter,
          checkEmptyDataSource,
        );
      }
    }
  }

  componentWillUnmount() {
    this.props.resetAudiencePartitionsTable();
  }

  archivePartition = (partition: AudiencePartitionResource) => {
    const {
      // match: { params: { organisationId } },
      // location: { search },
      // archiveAudiencePartition,
      // loadAudiencePartitionsDataSource,
      translations,
    } = this.props;

    // const filter = parseSearch(search, this.getSearchSetting(organisationId));

    Modal.confirm({
      title: translations.PARTITIONS_MODAL_CONFIRM_ARCHIVED_TITLE,
      content: translations.PARTITIONS_MODAL_CONFIRM_ARCHIVED_BODY,
      iconType: 'exclamation-circle',
      okText: translations.MODAL_CONFIRM_ARCHIVED_OK,
      cancelText: translations.MODAL_CONFIRM_ARCHIVED_CANCEL,
      onOk() {
        // WAITING BACKEND PART
        //   return archiveAudiencePartition(partition.id).then(() => {
        //     const datamartId = filter.datamarts[0];
        //     loadAudiencePartitionsDataSource(organisationId, datamartId, filter);
        //   });
      },
      onCancel() {
        //
      },
    });
  };

  editPartition = (partition: any) => {
    const { match: { params: { organisationId } }, history } = this.props;

    const editUrl = `/v2/o/${organisationId}/audience/partitions/${
      partition.id
    }/edit`;

    history.push({
      pathname: editUrl,
      search: `?datamart=${partition.datamart_id}&type=${partition.type}`,
      state: { from: `${location.pathname}${location.search}` },
    });
  };

  getSearchSetting(organisationId: string) {
    const { datamart, workspace } = this.props;
    const { datamartId } = this.state;

    return [
      ...PARTITIONS_SEARCH_SETTINGS,
      {
        paramName: 'datamarts',
        defaultValue: datamartId
          ? [parseInt(datamartId, 0)]
          : [parseInt(datamart.id, 0)],
        deserialize: (query: any) => {
          if (datamartId) {
            return [parseInt(datamartId, 0)];
          } else {
            if (workspace(organisationId).datamarts.length >= 1) {
              return workspace(organisationId).datamarts.map(d =>
                parseInt(d.id, 0),
              );
            }
            return [];
          }
        },
        serialize: (value: string[]) => value.join(','),
        isValid: (query: any) =>
          datamartId
            ? !isNaN(parseInt(datamartId, 0))
            : workspace(organisationId).datamarts.length >= 1 &&
              lodash.every(
                workspace(organisationId).datamarts,
                d => !isNaN(parseInt(d.id, 0)),
              ),
      },
    ];
  }

  updateLocationSearch = (params: Partial<FilterProps>) => {
    const {
      history,
      match: { params: { organisationId } },
      location: { search: currentSearch, pathname },
    } = this.props;

    const nextLocation = {
      pathname,
      search: updateSearch(
        currentSearch,
        params,
        this.getSearchSetting(organisationId),
      ),
    };

    history.push(nextLocation);
  };

  getFiltersOptions = () => {
    const { workspace, match: { params: { organisationId } } } = this.props;
    const datamartItems = workspace(organisationId).datamarts.map(d => ({
      key: d.id,
      value: d.name,
    }));

    return [
      {
        displayElement: (
          <div>
            <FormattedMessage id="Datamart" defaultMessage="Datamart" />{' '}
            <Icon type="down" />
          </div>
        ),
        selectedItems: this.state.datamartId
          ? [datamartItems.find(d => d.key === this.state.datamartId)]
          : [
              {
                key: datamartItems[0].key,
                value: datamartItems[0].value,
              },
            ],
        items: datamartItems,
        singleSelectOnly: true,
        getKey: (item: any) => item.key,
        display: (item: any) => item.value,
        handleItemClick: (datamartItem: { key: string; value: string }) => {
          this.setState({ datamartId: datamartItem.key });
        },
      },
    ];
  };

  render() {
    const {
      match: { params: { organisationId } },
      location: { search },
      translations,
      isFetchingAudiencePartitions,
      dataSource,
      totalAudiencePartitions,
      hasAudiencePartitions,
    } = this.props;

    const filter = parseSearch(search, this.getSearchSetting(organisationId));

    const searchOptions = {
      placeholder: translations.SEARCH_AUDIENCE_PARTITIONS,
      onSearch: (value: string) =>
        this.updateLocationSearch({
          keywords: value,
        }),
      defaultValue: filter.keywords,
    };

    const pagination = {
      current: filter.currentPage,
      pageSize: filter.pageSize,
      total: totalAudiencePartitions,
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

    const dataColumns = [
      {
        translationKey: 'NAME',
        key: 'name',
        render: (text: string, record: AudiencePartitionResource) => (
          <Link
            className="mcs-campaigns-link"
            to={`/v2/o/${organisationId}/audience/partitions/${record.id}`}
          >
            {text}
          </Link>
        ),
      },
      {
        translationKey: 'TYPE',
        key: 'audience_partition_type',
        isHideable: false,
        render: (text: string) => <span>{text}</span>,
      },
      {
        translationKey: 'PART_COUNT',
        key: 'part_count',
        render: (text: string) => <span>{text}</span>,
      },
      {
        translationKey: 'STATUS',
        key: 'status',
        render: (text: string) => <span>{text}</span>,
      },
    ];

    const actionColumns = [
      {
        key: 'action',
        actions: [
          {
            translationKey: 'EDIT',
            callback: this.editPartition,
          },
          // waiting backend part
          // {
          //   translationKey: 'ARCHIVE',
          //   callback: this.archivePartition,
          // },
        ],
      },
    ];

    return (
      <div className="mcs-table-container">
        <TableViewFilters
          columns={dataColumns}
          actionsColumnsDefinition={actionColumns}
          searchOptions={searchOptions}
          dataSource={hasAudiencePartitions ? dataSource : []}
          loading={isFetchingAudiencePartitions}
          pagination={pagination}
          filtersOptions={this.getFiltersOptions()}
        />
      </div>
    );
  }
}

const mapStateToProps = (state: any) => ({
  hasAudiencePartitions:
    state.audiencePartitionsTable.audiencePartitionsApi.hasItems,
  isFetchingAudiencePartitions:
    state.audiencePartitionsTable.audiencePartitionsApi.isFetching,
  dataSource: getTableDataSource(state),
  totalAudiencePartitions:
    state.audiencePartitionsTable.audiencePartitionsApi.total,
  workspace: getWorkspace(state),
});

const mapDispatchToProps = {
  loadAudiencePartitionsDataSource:
    AudiencePartitionsActions.fetchAudiencePartitionsList.request,
  // archiveAudiencePartition: AudiencePartitionsActions.archiveAudiencePartition,
  resetAudiencePartitionsTable:
    AudiencePartitionsActions.resetAudiencePartitionsTable,
};

export default compose<Props, {}>(
  withRouter,
  withTranslations,
  injectDatamart,
  connect(mapStateToProps, mapDispatchToProps),
)(AudiencePartitionsTable);
