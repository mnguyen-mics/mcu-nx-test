import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import lodash from 'lodash';
import { Modal } from 'antd';

import { TableView } from '../../../../components/TableView';

import * as AssetsFilesActions from '../../../../state/Library/AssetsFiles/actions';

import {
  ASSETS_FILES_SETTINGS,

  updateQueryWithParams,
  deserializeQuery
} from '../../RouteQuerySelector';

import {
  getTableDataSource
 } from '../../../../state//Library/AssetsFiles/selectors';

class AssetsFilesTable extends Component {

  constructor(props) {
    super(props);
    this.updateQueryParams = this.updateQueryParams.bind(this);
    this.archiveAsset = this.archiveAsset.bind(this);
    this.editAsset = this.editAsset.bind(this);
  }


  componentDidMount() {
    const {
      activeWorkspace: {
        organisationId
      },
      query,

      fetchAssetsFiles
    } = this.props;
    const filter = deserializeQuery(query, ASSETS_FILES_SETTINGS);
    fetchAssetsFiles(organisationId, filter);
  }

  componentWillReceiveProps(nextProps) {
    const {
      query,
      activeWorkspace: {
        workspaceId
      },

      fetchAssetsFiles
    } = this.props;

    const {
      query: nextQuery,
      activeWorkspace: {
        workspaceId: nextWorkspaceId,
        organisationId
      },
    } = nextProps;

    if (!lodash.isEqual(query, nextQuery) || workspaceId !== nextWorkspaceId) {
      const filter = deserializeQuery(nextQuery, ASSETS_FILES_SETTINGS);
      fetchAssetsFiles(organisationId, filter);
    }
  }

  componentWillUnmount() {
    this.props.resetAssetsFilesTable();
  }

  updateQueryParams(params) {
    const {
      router,
      query: currentQuery
    } = this.props;

    const location = router.getCurrentLocation();
    router.replace({
      pathname: location.pathname,
      query: updateQueryWithParams(currentQuery, params, ASSETS_FILES_SETTINGS)
    });
  }

  render() {
    const {
      query,
      activeWorkspace: {
        workspaceId
      },
      isFetchingAssetsFiles,
      dataSource,
      totalPlacements
    } = this.props;

    const filter = deserializeQuery(query, ASSETS_FILES_SETTINGS);

    const pagination = {
      currentPage: filter.currentPage,
      pageSize: filter.pageSize,
      total: totalPlacements,
      onChange: (page) => this.updateQueryParams({
        currentPage: page
      }),
      onShowSizeChange: (current, size) => this.updateQueryParams({
        pageSize: size
      })
    };


    const dataColumns = [
      {
        translationKey: 'PREVIEW',
        key: 'file_path',
        isHiddable: false,
        className: 'mcs-table-image-col',
        render: (text, record) => <div className="mics-small-thumbnail"><a target="_blank" rel="noreferrer noopener" href={`https://assets.mediarithmics.com${text}`} ><span className="thumbnail-helper" /><img src={`https://assets.mediarithmics.com${text}`} alt={record.original_filename} /></a></div>
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
        render: (text) => <span>{text}</span>
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

    return (<TableView
      columnsDefinitions={columnsDefinitions}
      dataSource={dataSource}
      loading={isFetchingAssetsFiles}
      onChange={() => {}}
      pagination={pagination}
    />);

  }

  editAsset(keyword) {
    const {
      activeWorkspace: {
        workspaceId
      },
      router
    } = this.props;

    router.push(`/${workspaceId}/library/keywordslists/${keyword.id}`);
  }

  archiveAsset(keyword) {
    const {
      activeWorkspace: {
        organisationId
      },
      archiveAssetList,
      fetchAssetsFiles,
      translations,
      query
    } = this.props;

    const filter = deserializeQuery(query, ASSETS_FILES_SETTINGS);

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
      onCancel() { },
    });
  }

}

AssetsFilesTable.defaultProps = {
  archiveAssetList: () => { }
};

AssetsFilesTable.propTypes = {
  router: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  activeWorkspace: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  translations: PropTypes.objectOf(PropTypes.string).isRequired,
  query: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types

  isFetchingAssetsFiles: PropTypes.bool.isRequired,
  dataSource: PropTypes.arrayOf(PropTypes.object).isRequired,
  totalPlacements: PropTypes.number.isRequired,

  fetchAssetsFiles: PropTypes.func.isRequired,
  archiveAssetList: PropTypes.func.isRequired,
  resetAssetsFilesTable: PropTypes.func.isRequired,
};

const mapStateToProps = (state, ownProps) => ({
  activeWorkspace: state.sessionState.activeWorkspace,
  query: ownProps.router.location.query,
  translations: state.translationsState.translations,

  isFetchingAssetsFiles: state.assetsFilesTable.assetsFilesApi.isFetching,
  dataSource: getTableDataSource(state),
  totalPlacements: state.assetsFilesTable.assetsFilesApi.total,
});

const mapDispatchToProps = {
  fetchAssetsFiles: AssetsFilesActions.fetchAssetsFiles.request,
  // archiveAssetList: CampaignEmailAction.archiveAssetList,
  resetAssetsFilesTable: AssetsFilesActions.resetAssetsFilesTable
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AssetsFilesTable);
