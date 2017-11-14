import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { Modal } from 'antd';

import { EmptyTableView } from '../../../../components/TableView/index.ts';
import LibraryTable from '../../LibraryTable';
import * as AssetsFilesActions from '../../../../state/Library/AssetsFiles/actions';
import { getTableDataSource } from '../../../../state//Library/AssetsFiles/selectors';
import { parseSearch, PAGINATION_SEARCH_SETTINGS } from '../../../../utils/LocationSearchHelper';

class AssetsFilesTable extends Component {

  archiveAsset = (asset) => {
    const {
      archiveAssetList,
      fetchAssetsFiles,
      location: { search },
      match: { params: { organisationId } },
      translations,
    } = this.props;

    const filter = parseSearch(search, PAGINATION_SEARCH_SETTINGS);

    Modal.confirm({
      iconType: 'exclamation-circle',
      title: translations.KEYWORD_MODAL_CONFIRM_ARCHIVED_TITLE,
      content: translations.KEYWORD_MODAL_CONFIRM_ARCHIVED_BODY,
      okText: translations.MODAL_CONFIRM_ARCHIVED_OK,
      cancelText: translations.MODAL_CONFIRM_ARCHIVED_CANCEL,
      onOk: () => (
        archiveAssetList(asset.id)
          .then(() => {
            fetchAssetsFiles(organisationId, filter);
          })
      ),
      onCancel: () => {},
    });
  }

  editAsset = (asset) => {
    const {
      history,
      match: { params: { organisationId } },
    } = this.props;

    history.push(`/${organisationId}/library/keywordslists/${asset.id}`);
  }

  getTableProps = () => {
    const { dataSource } = this.props;

    const columnsDefinitions = {
      actionsColumnsDefinition: [
        {
          key: 'action',
          actions: [
            { translationKey: 'ARCHIVE', callback: this.archiveAsset },
          ],
        },
      ],

      dataColumnsDefinition: [
        {
          translationKey: 'PREVIEW',
          key: 'file_path',
          isHideable: false,
          className: 'mcs-table-image-col',
          render: (text, record) => (
            <div className="mcs-table-cell-thumbnail">
              <a target="_blank" rel="noreferrer noopener" href={`https://assets.mediarithmics.com${text}`}>
                <span className="thumbnail-helper" /><img src={`https://assets.mediarithmics.com${text}`} alt={record.original_filename} />
              </a>
            </div>
          ),
        },
        {
          translationKey: 'NAME',
          key: 'original_filename',
          isHideable: false,
          render: (text, record) => (
            <a
              href={`https://assets.mediarithmics.com${record.file_path}`}
              rel="noreferrer noopener"
              target="_blank"
            >{text}
            </a>
          ),
        },
        {
          translationKey: 'TYPE',
          key: 'mime_type',
          isHideable: false,
          render: text => <span>{text}</span>,
        },
        {
          translationKey: 'DIMENSIONS',
          key: 'width',
          isHideable: false,
          render: (text, record) => <span>{text}x{record.height}</span>,
        },
      ],
    };

    return { columnsDefinitions, dataSource };
  }

  render() {
    const {
      fetchAssetsFiles,
      hasFetchingAssetsItems,
      isFetchingAssetsFiles,
      resetAssetsFiles,
      totalAssets
    } = this.props;

    const actions = {
      fetchElements: fetchAssetsFiles,
      resetElements: resetAssetsFiles,
    };

    const libraryProps = {
      loading: isFetchingAssetsFiles,
      total: totalAssets,
    };

    const tableProps = this.getTableProps();

    return (!hasFetchingAssetsItems
      ? <EmptyTableView iconType="library" text="EMPTY_LIBRARY_ASSETS" />
      : (
        <LibraryTable
          actions={actions}
          libraryProps={libraryProps}
          tableProps={tableProps}
        />
      )
    );
  }
}

AssetsFilesTable.defaultProps = {
  archiveAssetList: () => Promise.resolve(),
};

AssetsFilesTable.propTypes = {
  archiveAssetList: PropTypes.func.isRequired,
  dataSource: PropTypes.arrayOf(PropTypes.object).isRequired,
  fetchAssetsFiles: PropTypes.func.isRequired,
  hasFetchingAssetsItems: PropTypes.bool.isRequired,
  history: PropTypes.shape().isRequired,
  isFetchingAssetsFiles: PropTypes.bool.isRequired,
  match: PropTypes.shape().isRequired,
  location: PropTypes.shape().isRequired,
  resetAssetsFiles: PropTypes.func.isRequired,
  totalAssets: PropTypes.number.isRequired,
  translations: PropTypes.objectOf(PropTypes.string).isRequired,
};

const mapStateToProps = state => ({
  dataSource: getTableDataSource(state),
  hasFetchingAssetsItems: state.placementListTable.placementListsApi.hasItems,
  isFetchingAssetsFiles: state.placementListTable.placementListsApi.isFetching,
  totalAssets: state.placementListTable.placementListsApi.total,
  translations: state.translations,
});

const mapDispatchToProps = {
  // archiveAssetList: EmailCampaignAction.archiveAssetList,
  fetchAssetsFiles: AssetsFilesActions.fetchAssetsFiles.request,
  resetAssetsFiles: AssetsFilesActions.resetAssetsFiles,
};

export default compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps),
)(AssetsFilesTable);
