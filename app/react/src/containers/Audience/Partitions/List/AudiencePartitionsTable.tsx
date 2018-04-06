import * as React from 'react';
import { connect } from 'react-redux';
import { Link, withRouter, RouteComponentProps } from 'react-router-dom';
import { Modal } from 'antd';
import lodash from 'lodash';
import { compose } from 'recompose';

import {
  TableViewFilters,
  EmptyTableView,
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
import { getDefaultDatamart } from '../../../../state/Session/selectors';
import { TranslationProps } from '../../../Helpers/withTranslations';
import { withTranslations } from '../../../Helpers';
import { Datamart } from '../../../../models/organisation/organisation';
import McsMoment from '../../../../utils/McsMoment';
import { CampaignStatus } from '../../../../models/campaign/constants';

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
  dataSource: any[]; // use partition type
  totalAudiencePartitions: number;
  defaultDatamart: (organisationId: string) => Datamart;
  hasAudiencePartitions: boolean;
}

interface MapDispatchToProps {
  loadAudiencePartitionsDataSource: (
    organisationId: string,
    datamartId: string,
    filter: FilterProps,
    bool?: boolean,
  ) => any[]; // use partition type
  archiveAudiencePartition: (partitionId: string) => void;
  resetAudiencePartitionsTable: () => void;
}

type Props = MapStateToProps &
  MapDispatchToProps &
  TranslationProps &
  RouteComponentProps<{ organisationId: string }>;

class AudiencePartitionsTable extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
    this.updateLocationSearch = this.updateLocationSearch.bind(this);
    this.archivePartition = this.archivePartition.bind(this);
    this.editPartition = this.editPartition.bind(this);
  }

  componentDidMount() {
    const {
      history,
      location: { search, pathname },
      match: { params: { organisationId } },
      loadAudiencePartitionsDataSource,
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
      const filter = parseSearch(search, this.getSearchSetting(organisationId));
      const datamartId = filter.datamarts[0];

      loadAudiencePartitionsDataSource(
        organisationId,
        datamartId,
        filter,
        true,
      );
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

  archivePartition = (partition: any) => {
    // use partition type
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
    const { defaultDatamart } = this.props;

    return [
      ...PARTITIONS_SEARCH_SETTINGS,
      {
        paramName: 'datamarts',
        defaultValue: [parseInt(defaultDatamart(organisationId).id, 0)],
        deserialize: (query: any) => {
          if (query.datamarts) {
            return query.datamarts
              .split(',')
              .map((d: string) => parseInt(d, 0));
          }
          return [];
        },
        serialize: (value: string[]) => value.join(','),
        isValid: (query: any) =>
          query.datamarts &&
          query.datamarts.split(',').length > 0 &&
          lodash.every(query.datamarts, d => !isNaN(parseInt(d, 0))),
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
        render: (
          text: string,
          record: any, // use partition type
        ) => (
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

    return hasAudiencePartitions ? (
      <div className="mcs-table-container">
        <TableViewFilters
          columns={dataColumns}
          actionsColumnsDefinition={actionColumns}
          searchOptions={searchOptions}
          dataSource={dataSource}
          loading={isFetchingAudiencePartitions}
          pagination={pagination}
        />
      </div>
    ) : (
      <EmptyTableView iconType="partitions" text="EMPTY_PARTITIONS" />
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
  defaultDatamart: getDefaultDatamart(state),
});

const mapDispatchToProps = {
  loadAudiencePartitionsDataSource:
    AudiencePartitionsActions.fetchAudiencePartitionsList.request,
  // archiveAudiencePartition: AudiencePartitionsActions.archiveAudiencePartition,
  resetAudiencePartitionsTable:
    AudiencePartitionsActions.resetAudiencePartitionsTable,
};

export default compose(
  withRouter,
  withTranslations,
  connect(mapStateToProps, mapDispatchToProps),
)(AudiencePartitionsTable);
