import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { Modal } from 'antd';

import { TableViewFilters, TableView, EmptyTableView } from '../../../../components/TableView';

import * as AssetsFilesActions from '../../../../state/Library/AssetsFiles/actions';

import { ASSETS_SEARCH_SETTINGS } from './constants';
import { updateSearch, parseSearch, isSearchValid, buildDefaultSearch, compareSearchs } from '../../../../utils/LocationSearchHelper';

import { getTableDataSource } from '../../../../state//Library/AssetsFiles/selectors';

class AssetsFilesTable extends Component {
  constructor(props) {
    super(props);
    this.updateLocationSearch = this.updateLocationSearch.bind(this);
    this.archiveAsset = this.archiveAsset.bind(this);
    this.editAsset = this.editAsset.bind(this);
  }

  componentDidMount() {
    const { history, location: { search, pathname }, match: { params: { organisationId } }, fetchAssetsFiles } = this.props;

    if (!isSearchValid(search, ASSETS_SEARCH_SETTINGS)) {
      history.replace({
        pathname: pathname,
        search: buildDefaultSearch(search, ASSETS_SEARCH_SETTINGS),
        state: { reloadDataSource: true }
      });
    } else {
      const filter = parseSearch(search, ASSETS_SEARCH_SETTINGS);
      fetchAssetsFiles(organisationId, filter, true);
    }
  }

  componentWillReceiveProps(nextProps) {
    const {
      location: {
        search
      },
      match: {
        params: {
          organisationId
        }
      },
      history,
      fetchAssetsFiles
    } = this.props;

    const {
      location: {
        pathname: nextPathname,
        search: nextSearch,
        state
      },
      match: {
        params: {
          organisationId: nextOrganisationId
        }
      }
    } = nextProps;

    const checkEmptyDataSource = state && state.reloadDataSource;

    if (!compareSearchs(search, nextSearch) || organisationId !== nextOrganisationId) {
      if (!isSearchValid(nextSearch, ASSETS_SEARCH_SETTINGS)) {
        history.replace({
          pathname: nextPathname,
          search: buildDefaultSearch(nextSearch, ASSETS_SEARCH_SETTINGS),
          state: { reloadDataSource: organisationId !== nextOrganisationId }
        });
      } else {
        const filter = parseSearch(nextSearch, ASSETS_SEARCH_SETTINGS);
        fetchAssetsFiles(nextOrganisationId, filter, checkEmptyDataSource);
      }
    }
  }

  componentWillUnmount() {
    this.props.resetAssetsFiles();
  }

  updateLocationSearch(params) {
    const { history, location: { search: currentSearch, pathname } } = this.props;

    const nextLocation = {
      pathname,
      search: updateSearch(currentSearch, params, ASSETS_SEARCH_SETTINGS)
    };

    history.push(nextLocation);
  }

  render() {
    const {
      location: {
        search
      },
      isFetchingAssetsFiles,
      dataSource,
      totalPlacements,
      hasFetchingAssetsItems
    } = this.props;

    const filter = parseSearch(search, ASSETS_SEARCH_SETTINGS);

    const pagination = {
      currentPage: filter.currentPage,
      pageSize: filter.pageSize,
      total: totalPlacements,
      onChange: page =>
        this.updateLocationSearch({
          currentPage: page
        }),
      onShowSizeChange: (current, size) =>
        this.updateLocationSearch({
          pageSize: size
        })
    };

    const dataColumns = [
      {
        translationKey: 'PREVIEW',
        key: 'file_path',
        isHiddable: false,
        className: 'mcs-table-image-col',
        render: (text, record) => (
          <div className="mcs-table-cell-thumbnail">
            <a target="_blank" rel="noreferrer noopener" href={`https://assets.mediarithmics.com${text}`}>
              <span className="thumbnail-helper" /><img src={`https://assets.mediarithmics.com${text}`} alt={record.original_filename} />
            </a>
          </div>
        )
      },
      {
        translationKey: 'NAME',
        key: 'original_filename',
        isHiddable: false,
        render: (text, record) => <a href={`https://assets.mediarithmics.com${record.file_path}`} target="_blank" rel="noreferrer noopener">{text}</a>
      },
      {
        translationKey: 'TYPE',
        key: 'mime_type',
        isHiddable: false,
        render: text => <span>{text}</span>
      },
      {
        translationKey: 'DIMENSIONS',
        key: 'width',
        isHiddable: false,
        render: (text, record) => <span>{text}x{record.height}</span>
      }
    ];

    const actionColumns = [
      {
        key: 'action',
        actions: [
          {
            translationKey: 'ARCHIVE',
            callback: this.archiveAsset
          }
        ]
      }
    ];

    const columnsDefinitions = {
      dataColumnsDefinition: dataColumns,
      actionsColumnsDefinition: actionColumns
    };

    return hasFetchingAssetsItems ? (
      <TableViewFilters
        columnsDefinitions={columnsDefinitions}
      >
        <TableView
          columnsDefinitions={columnsDefinitions}
          dataSource={dataSource}
          loading={isFetchingAssetsFiles}
          pagination={pagination}
        />
      </TableViewFilters>) : (<EmptyTableView iconType="library" text="EMPTY_LIBRARY_ASSETS" />);

  }

  editAsset(keyword) {
    const { match: { params: { organisationId } }, history } = this.props;

    history.push(`/${organisationId}/library/keywordslists/${keyword.id}`);
  }

  archiveAsset(keyword) {
    const { match: { params: { organisationId } }, location: { search }, archiveAssetList, fetchAssetsFiles, translations } = this.props;

    const filter = parseSearch(search, ASSETS_SEARCH_SETTINGS);

    Modal.confirm({
      title: translations.KEYWORD_MODAL_CONFIRM_ARCHIVED_TITLE,
      content: translations.KEYWORD_MODAL_CONFIRM_ARCHIVED_BODY,
      iconType: 'exclamation-circle',
      okText: translations.MODAL_CONFIRM_ARCHIVED_OK,
      cancelText: translations.MODAL_CONFIRM_ARCHIVED_CANCEL,
      onOk() {
        return archiveAssetList(keyword.id).then(() => {
          fetchAssetsFiles(organisationId, filter);
        });
      },
      onCancel() {}
    });
  }
}

AssetsFilesTable.defaultProps = {
  archiveAssetList: () => {}
};

AssetsFilesTable.propTypes = {
  match: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  location: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  history: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  translations: PropTypes.objectOf(PropTypes.string).isRequired,

  isFetchingAssetsFiles: PropTypes.bool.isRequired,
  dataSource: PropTypes.arrayOf(PropTypes.object).isRequired,
  totalPlacements: PropTypes.number.isRequired,
  hasFetchingAssetsItems: PropTypes.bool.isRequired,

  fetchAssetsFiles: PropTypes.func.isRequired,
  archiveAssetList: PropTypes.func.isRequired,
  resetAssetsFiles: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
  translations: state.translations,
  hasFetchingAssetsItems: state.assetsFilesTable.assetsFilesApi.hasItems,
  isFetchingAssetsFiles: state.assetsFilesTable.assetsFilesApi.isFetching,
  dataSource: getTableDataSource(state),
  totalPlacements: state.assetsFilesTable.assetsFilesApi.total
});

const mapDispatchToProps = {
  fetchAssetsFiles: AssetsFilesActions.fetchAssetsFiles.request,
  // archiveAssetList: CampaignEmailAction.archiveAssetList,
  resetAssetsFiles: AssetsFilesActions.resetAssetsFiles
};

AssetsFilesTable = connect(mapStateToProps, mapDispatchToProps)(AssetsFilesTable);

AssetsFilesTable = withRouter(AssetsFilesTable);

export default AssetsFilesTable;
