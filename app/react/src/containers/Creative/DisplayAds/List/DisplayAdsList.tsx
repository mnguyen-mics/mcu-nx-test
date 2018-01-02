import * as React from 'react';
import { connect } from 'react-redux';
import {  InjectedIntlProps } from 'react-intl';
import { Link, withRouter } from 'react-router-dom';
import { Modal } from 'antd';
import { RouteComponentProps } from 'react-router';
import { compose } from 'recompose';

import { TableViewFilters, EmptyTableView } from '../../../../components/TableView';
import * as CreativeDisplayActions from '../../../../state/Creatives/Display/actions';
import { CREATIVE_DISPLAY_SEARCH_SETTINGS } from './constants';
import { updateSearch, parseSearch, isSearchValid, buildDefaultSearch, compareSearches } from '../../../../utils/LocationSearchHelper';
import {
  getDisplayCreatives,
  getDisplayCreativesTotal,
  hasDisplayCreatives,
  isFetchingDisplayCreatives,
} from '../../../../state/Creatives/Display/selectors';
import CreativeScreenshot from '../../CreativeScreenshot';
import messages from './message';
import CreativeService from '../../../../services/CreativeService';
import { CampaignRouteParams } from '../../../../models/campaign/CampaignResource';
import { DisplayAdResource } from '../../../../models/creative/CreativeResource';

interface DisplayAdsListProps {
  isFetchingCreativeDisplay: boolean;
  dataSource: object[]; // type better
  totalCreativeDisplay: number;
  hasCreativeDisplay: boolean;
  fetchCreativeDisplay: (organisationId: string, filter: object, bool: boolean) => void;
  resetCreativeDisplay: () => void;
  archiveCreativeDisplay: () => void;
}

type JoinedProps = DisplayAdsListProps &
  RouteComponentProps<CampaignRouteParams> &
  InjectedIntlProps;

class CreativeDisplayTable extends React.Component<JoinedProps> {

  static defaultProps: Partial<JoinedProps> = {
    archiveCreativeDisplay: () => undefined,
  };

  constructor(props: JoinedProps) {
    super(props);
    this.updateLocationSearch = this.updateLocationSearch.bind(this);
    this.archiveCreativeDisplay = this.archiveCreativeDisplay.bind(this);
    this.editCreativeDisplay = this.editCreativeDisplay.bind(this);
  }

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
      location: {
        search,
      },
      match: {
        params: {
          organisationId,
        },
      },
      history,
      fetchCreativeDisplay,
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

    if (!compareSearches(search, nextSearch) || organisationId !== nextOrganisationId) {
      if (!isSearchValid(nextSearch, CREATIVE_DISPLAY_SEARCH_SETTINGS)) {
        history.replace({
          pathname: nextPathname,
          search: buildDefaultSearch(nextSearch, CREATIVE_DISPLAY_SEARCH_SETTINGS),
          state: { reloadDataSource: organisationId !== nextOrganisationId },
        });
      } else {
        const filter = parseSearch(nextSearch, CREATIVE_DISPLAY_SEARCH_SETTINGS);
        fetchCreativeDisplay(nextOrganisationId, filter, checkEmptyDataSource);
      }
    }
  }

  componentWillUnmount() {
    this.props.resetCreativeDisplay();
  }

  updateLocationSearch(params: object) {
    const { history, location: { search: currentSearch, pathname } } = this.props;

    const nextLocation = {
      pathname,
      search: updateSearch(currentSearch, params, CREATIVE_DISPLAY_SEARCH_SETTINGS),
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
      isFetchingCreativeDisplay,
      dataSource,
      totalCreativeDisplay,
      hasCreativeDisplay,
    } = this.props;

    const filter = parseSearch(search, CREATIVE_DISPLAY_SEARCH_SETTINGS);

    const pagination = {
      current: filter.currentPage,
      pageSize: filter.pageSize,
      total: totalCreativeDisplay,
      onChange: (page: number) =>
        this.updateLocationSearch({
          currentPage: page,
        }),
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
          <Link className="mcs-campaigns-link" to={`/v2/o/${organisationId}/creatives/display/edit/${record.id}`}>{text}</Link>
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
          loading={isFetchingCreativeDisplay}
          pagination={pagination}
        />
      </div>) : (<EmptyTableView iconType="display" text="EMPTY_CREATIVES_DISPLAY" />);

  }

  editCreativeDisplay(creative: DisplayAdResource) {
    const { match: { params: { organisationId } }, history } = this.props;

    history.push(`/v2/o/${organisationId}/creatives/display/edit/${creative.id}`);
  }

  archiveCreativeDisplay(creative: DisplayAdResource) {
    const {
      match: {
        params: {
          organisationId,
        },
      },
      location: {
        search,
        pathname,
        state,
      },
      fetchCreativeDisplay,
      intl: { formatMessage },
      history,
      dataSource,
    } = this.props;

    const filter = parseSearch(search, CREATIVE_DISPLAY_SEARCH_SETTINGS);

    Modal.confirm({
      title: formatMessage(messages.creativeModalConfirmArchivedTitle),
      content: formatMessage(messages.creativeModalConfirmArchivedContent),
      iconType: 'exclamation-circle',
      okText: formatMessage(messages.creativeModalConfirmArchivedOk),
      cancelText: formatMessage(messages.cancelText),
      onOk() {
        CreativeService.updateDisplayCreative(creative.id, { ...creative, archived: true }).then(() => {
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
            return Promise.resolve();
          }
          fetchCreativeDisplay(organisationId, filter, true);
          return Promise.resolve();
        });
      },
      onCancel() {
        //
      },
    });
  }
}

const mapStateToProps = (state: any) => ({
  translations: state.translations,
  hasCreativeDisplay: hasDisplayCreatives(state),
  isFetchingCreativeDisplay: isFetchingDisplayCreatives(state),
  dataSource: getDisplayCreatives(state),
  totalCreativeDisplay: getDisplayCreativesTotal(state),
});

const mapDispatchToProps = {
  fetchCreativeDisplay: CreativeDisplayActions.fetchCreativeDisplay.request,
  resetCreativeDisplay: CreativeDisplayActions.resetCreativeDisplay,
};

export default compose<JoinedProps, DisplayAdsListProps>(
  withRouter,
  connect(
    mapStateToProps, mapDispatchToProps,
  ),
)(CreativeDisplayTable);
