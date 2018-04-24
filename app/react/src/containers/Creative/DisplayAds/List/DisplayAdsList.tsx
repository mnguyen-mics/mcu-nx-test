import * as React from 'react';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import { Link, withRouter } from 'react-router-dom';
import { Modal } from 'antd';
import { RouteComponentProps } from 'react-router';
import { compose } from 'recompose';

import {
  TableViewFilters,
  EmptyTableView,
} from '../../../../components/TableView';
import { CREATIVE_DISPLAY_SEARCH_SETTINGS } from './constants';
import {
  updateSearch,
  parseSearch,
  isSearchValid,
  buildDefaultSearch,
  compareSearches,
} from '../../../../utils/LocationSearchHelper';

import CreativeScreenshot from '../../CreativeScreenshot';
import messages from './message';
import CreativeService from '../../../../services/CreativeService';
import { CampaignRouteParams } from '../../../../models/campaign/CampaignResource';
import { DisplayAdResource } from '../../../../models/creative/CreativeResource';
import { MapDispatchToProps, MapStateToProps } from './DisplayAdsPage';
import { ExtendedTableRowSelection } from '../../../../components/TableView/TableView';

interface DisplayAdsListProps extends MapStateToProps, MapDispatchToProps {
  rowSelection: ExtendedTableRowSelection;
  isUpdatingAuditStatus: boolean;
}

type JoinedProps = DisplayAdsListProps &
  RouteComponentProps<CampaignRouteParams> &
  InjectedIntlProps;

class CreativeDisplayTable extends React.Component<JoinedProps> {
  constructor(props: JoinedProps) {
    super(props);
    this.updateLocationSearch = this.updateLocationSearch.bind(this);
    this.archiveCreativeDisplay = this.archiveCreativeDisplay.bind(this);
    this.editCreativeDisplay = this.editCreativeDisplay.bind(this);
  }

  componentDidMount() {
    const {
      history,
      location: { search, pathname },
      match: { params: { organisationId } },
      fetchCreativeDisplay,
    } = this.props;

    if (!isSearchValid(search, CREATIVE_DISPLAY_SEARCH_SETTINGS)) {
      history.replace({
        pathname: pathname,
        search: buildDefaultSearch(search, CREATIVE_DISPLAY_SEARCH_SETTINGS),
        state: { reloadDataSource: true },
      });
    } else {
      const filter = parseSearch(search, CREATIVE_DISPLAY_SEARCH_SETTINGS);
      fetchCreativeDisplay(organisationId, filter, true);
    }
  }

  componentWillReceiveProps(nextProps: JoinedProps) {
    const {
      location: { search },
      match: { params: { organisationId } },
      history,
      fetchCreativeDisplay,
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
      if (!isSearchValid(nextSearch, CREATIVE_DISPLAY_SEARCH_SETTINGS)) {
        history.replace({
          pathname: nextPathname,
          search: buildDefaultSearch(
            nextSearch,
            CREATIVE_DISPLAY_SEARCH_SETTINGS,
          ),
          state: { reloadDataSource: organisationId !== nextOrganisationId },
        });
      } else {
        const filter = parseSearch(
          nextSearch,
          CREATIVE_DISPLAY_SEARCH_SETTINGS,
        );
        fetchCreativeDisplay(nextOrganisationId, filter, checkEmptyDataSource);
      }
    }
  }

  componentWillUnmount() {
    this.props.resetCreativeDisplay();
  }

  updateLocationSearch(params: object) {
    const {
      history,
      location: { search: currentSearch, pathname },
    } = this.props;

    const nextLocation = {
      pathname,
      search: updateSearch(
        currentSearch,
        params,
        CREATIVE_DISPLAY_SEARCH_SETTINGS,
      ),
    };

    history.push(nextLocation);
  }

  render() {
    const {
      match: { params: { organisationId } },
      location: { search },
      isFetchingCreativeDisplay,
      dataSource,
      totalCreativeDisplay,
      hasCreativeDisplay,
      rowSelection,
      isUpdatingAuditStatus,
      intl,
    } = this.props;

    const filter = parseSearch(search, CREATIVE_DISPLAY_SEARCH_SETTINGS);

    const searchOptions = {
      placeholder: intl.formatMessage(messages.creativeModalSearchPlaceholder),
      onSearch: (value: string) => this.updateLocationSearch({
        keywords: value,
        currentPage: 1
      }),
      defaultValue: filter.keywords,
    };

    const pagination = {
      current: filter.currentPage,
      pageSize: filter.pageSize,
      total: totalCreativeDisplay,
      onChange: (page: number) => {
        this.updateLocationSearch({
          currentPage: page,
        });
        if (
          rowSelection &&
          rowSelection.unselectAllItemIds &&
          rowSelection.allRowsAreSelected
        ) {
          rowSelection.unselectAllItemIds();
        }
      },
      onShowSizeChange: (current: number, size: number) =>
        this.updateLocationSearch({
          pageSize: size,
          currentPage: 1,
        }),
    };

    const dataColumns = [
      {
        translationKey: 'PREVIEW',
        key: 'asset_path',
        isHideable: false,
        className: 'mcs-table-image-col',
        render: (text: string, record: DisplayAdResource) => (
          <CreativeScreenshot item={record} />
        ),
      },
      {
        translationKey: 'NAME',
        key: 'name',
        isHideable: false,
        render: (text: string, record: DisplayAdResource) => (
          <Link
            className="mcs-campaigns-link"
            to={`/v2/o/${organisationId}/creatives/display/edit/${record.id}`}
          >
            {text}
          </Link>
        ),
      },
      {
        translationKey: 'AUDIT_STATUS',
        key: 'audit_status',
        isHideable: false,
        render: (text: string) => <span>{text}</span>,
      },
      {
        translationKey: 'PUBLISHED_VERSION',
        key: 'published_version',
        isHideable: false,
        render: (text: string) => <span>{text}</span>,
      },
    ];

    const actionColumns = [
      {
        key: 'action',
        actions: [
          {
            translationKey: 'EDIT',
            callback: this.editCreativeDisplay,
          },
          {
            translationKey: 'ARCHIVE',
            callback: this.archiveCreativeDisplay,
          },
        ],
      },
    ];

    return hasCreativeDisplay ? (
      <div className="mcs-table-container">
        <TableViewFilters
          columns={dataColumns}
          actionsColumnsDefinition={actionColumns}
          dataSource={dataSource}
          loading={isFetchingCreativeDisplay || isUpdatingAuditStatus}
          pagination={pagination}
          rowSelection={rowSelection}
          searchOptions={searchOptions}
        />
      </div>
    ) : (
        <EmptyTableView iconType="display" text="EMPTY_CREATIVES_DISPLAY" />
      );
  }

  editCreativeDisplay(creative: DisplayAdResource) {
    const { match: { params: { organisationId } }, history } = this.props;

    history.push(
      `/v2/o/${organisationId}/creatives/display/edit/${creative.id}`,
    );
  }
  archiveCreativeDisplay(creative: DisplayAdResource) {
    const {
      match: { params: { organisationId } },
      location: { search, pathname, state },
      fetchCreativeDisplay,
      intl,
      history,
      dataSource,
    } = this.props;

    const filter = parseSearch(search, CREATIVE_DISPLAY_SEARCH_SETTINGS);
    if (creative.audit_status === 'NOT_AUDITED') {
      Modal.confirm({
        title: intl.formatMessage(messages.creativeModalConfirmArchivedTitle),
        content: intl.formatMessage(messages.creativeModalConfirmArchivedContent),
        iconType: 'exclamation-circle',
        okText: intl.formatMessage(messages.creativeModalConfirmArchivedOk),
        cancelText: intl.formatMessage(messages.cancelText),
        onOk() {
          CreativeService.updateDisplayCreative(creative.id, {
            ...creative,
            archived: true,
          }).then(() => {
            if (dataSource.length === 1 && filter.currentPage !== 1) {
              const newFilter = {
                ...filter,
                currentPage: filter.currentPage - 1,
              };
              fetchCreativeDisplay(organisationId, filter, true);
              history.replace({
                pathname: pathname,
                search: updateSearch(search, newFilter),
                state: state,
              });
            }
            fetchCreativeDisplay(organisationId, filter, true);
          });
        },
        onCancel() {
          //
        },
      });
    } else {
      Modal.warning({
        title: intl.formatMessage(messages.creativeModalNoArchiveTitle),
        content: intl.formatMessage(messages.creativeModalNoArchiveMessage),
        iconType: 'exclamation-circle',
      })
    }

  }
}

export default compose<JoinedProps, DisplayAdsListProps>(
  withRouter,
  injectIntl,
)(CreativeDisplayTable);
