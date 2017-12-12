import * as React from 'react';
import { compose } from 'recompose';
import { withRouter, RouteComponentProps } from 'react-router';
import { Modal } from 'antd';
import { injectIntl, InjectedIntlProps, FormattedMessage } from 'react-intl';

import { McsIconType } from '../../../../components/McsIcons';
import ItemList, { Filters } from '../../../../components/ItemList';
import AssetsFilesService from '../../../../services/Library/AssetsFilesService';
import { AssetFileResource } from '../../../../models/assets/assets';
import { PAGINATION_SEARCH_SETTINGS, parseSearch, updateSearch } from '../../../../utils/LocationSearchHelper';
import { getPaginatedApiParam } from '../../../../utils/ApiHelper';
import messages from './messages';

const initialState = {
  loading: false,
  data: [],
  total: 0,
};

interface AssetListContentState {
  loading: boolean;
  data: AssetFileResource[];
  total: number;
}

interface RouterProps {
  organisationId: string;
}

class AssetListContent extends React.Component<RouteComponentProps<RouterProps> & InjectedIntlProps, AssetListContentState> {

  state = initialState;

  archiveAssetList = (assetId: string) => {
    return AssetsFilesService.deleteAssetsFile(assetId);
  }

  fetchAssetList = (organisationId: string, filter: Filters) => {
    this.setState({ loading: true }, () => {
      const options = {
        ...getPaginatedApiParam(filter.currentPage, filter.pageSize),
      };
      AssetsFilesService.getAssetsFiles(organisationId, options)
        .then((results) => {
          this.setState({
            loading: false,
            data: results.data,
            total: results.total || results.count,
          });
        });
    });
  }

  onClickArchive = (asset: AssetFileResource) => {
    const {
      location: {
        search,
        state,
        pathname,
      },
      history,
      match: { params: { organisationId } },
      intl: { formatMessage },
    } = this.props;

    const {
      data,
    } = this.state;

    const filter = parseSearch(search, PAGINATION_SEARCH_SETTINGS);

    Modal.confirm({
      iconType: 'exclamation-circle',
      title: formatMessage(messages.assetArchiveTitle),
      content: formatMessage(messages.assetArchiveMessage),
      okText: formatMessage(messages.assetArchiveOk),
      cancelText: formatMessage(messages.assetArchiveCancel),
      onOk: () => {
        this.archiveAssetList(asset.id)
        .then(() => {
          if (data.length === 1 && filter.currentPage !== 1) {
            const newFilter = {
              ...filter,
              currentPage: filter.currentPage - 1,
            };
            history.replace({
              pathname: pathname,
              search: updateSearch(search, newFilter),
              state: state,
            });
            return Promise.resolve();
          }
          return this.fetchAssetList(organisationId, filter);
        });
      },
      onCancel: () => {
        // cancel
      },
    });
  }

  resetAssetList = () => {
    this.setState(initialState);
  }

  render() {
    const actions = {
      fetchList: this.fetchAssetList,
      resetList: this.resetAssetList,
    };

    const columnsDefinitions = {
      actionsColumnsDefinition: [
        {
          key: 'action',
          actions: [
            { translationKey: 'ARCHIVE', callback: this.onClickArchive },
          ],
        },
      ],

      dataColumnsDefinition: [
        {
          translationKey: 'PREVIEW',
          intlMessage: messages.preview,
          key: 'file_path',
          isHideable: false,
          className: 'mcs-table-image-col',
          render: (text: string, record: AssetFileResource) => (
            <div className="mcs-table-cell-thumbnail">
              <a target="_blank" rel="noreferrer noopener" href={`https://assets.mediarithmics.com${text}`}>
                <span className="thumbnail-helper" /><img src={`https://assets.mediarithmics.com${text}`} alt={record.original_filename} />
              </a>
            </div>
          ),
        },
        {
          translationKey: 'NAME',
          intlMessage: messages.name,
          key: 'original_filename',
          isHideable: false,
          render: (text: string, record: AssetFileResource) => (
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
          intlMessage: messages.type,
          key: 'mime_type',
          isHideable: false,
          render: (text: string) => <span>{text}</span>,
        },
        {
          translationKey: 'DIMENSIONS',
          intlMessage: messages.dimensions,
          key: 'width',
          isHideable: false,
          render: (text: string, record: AssetFileResource) => <span>{text}x{record.height}</span>,
        },
      ],
    };

    const emptyTable: {
      iconType: McsIconType,
      intlMessage: FormattedMessage.Props,
    } = {
      iconType: 'library',
      intlMessage: messages.empty,
    };

    return (
      <ItemList
        actions={actions}
        dataSource={this.state.data}
        isLoading={this.state.loading}
        total={this.state.total}
        columnsDefinitions={columnsDefinitions}
        pageSettings={PAGINATION_SEARCH_SETTINGS}
        emptyTable={emptyTable}
      />
    );
  }
}

export default compose(
  withRouter,
  injectIntl,
)(AssetListContent);
