import * as React from 'react';
import { compose } from 'recompose';
import { withRouter, RouteComponentProps } from 'react-router';
import { Modal, Layout } from 'antd';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import ItemList, { Filters } from '../../../../components/ItemList';
import { AssetFileResource } from '../../../../models/assets/assets';
import {
  PAGINATION_SEARCH_SETTINGS,
  parseSearch,
  updateSearch,
} from '../../../../utils/LocationSearchHelper';
import { getPaginatedApiParam } from '../../../../utils/ApiHelper';
import AssetListActionBar from './AssetListActionBar';
import messages from './messages';
import { lazyInject } from '../../../../config/inversify.config';
import { TYPES } from '../../../../constants/types';
import { IAssetFileService } from '../../../../services/Library/AssetFileService';
import { McsIconType } from '@mediarithmics-private/mcs-components-library/lib/components/mcs-icon';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import {
  ActionsColumnDefinition,
  DataColumnDefinition,
} from '@mediarithmics-private/mcs-components-library/lib/components/table-view/table-view/TableView';

const { Content } = Layout;

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

class AssetListContent extends React.Component<
  RouteComponentProps<RouterProps> & InjectedIntlProps,
  AssetListContentState
> {
  state = initialState;

  @lazyInject(TYPES.IAssetFileService)
  private _assetFileService: IAssetFileService;

  archiveAssetList = (assetId: string) => {
    return this._assetFileService.deleteAssetsFile(assetId);
  };

  fetchAssetList = (organisationId: string, filter: Filters) => {
    this.setState({ loading: true }, () => {
      const options = {
        ...getPaginatedApiParam(filter.currentPage, filter.pageSize),
      };
      this._assetFileService.getAssetsFiles(organisationId, options).then(results => {
        this.setState({
          loading: false,
          data: results.data,
          total: results.total || results.count,
        });
      });
    });
  };

  onClickArchive = (asset: AssetFileResource) => {
    const {
      location: { search, state, pathname },
      history,
      match: {
        params: { organisationId },
      },
      intl: { formatMessage },
    } = this.props;

    const { data } = this.state;

    const filter = parseSearch(search, PAGINATION_SEARCH_SETTINGS);

    Modal.confirm({
      icon: <ExclamationCircleOutlined />,
      title: formatMessage(messages.assetArchiveTitle),
      content: formatMessage(messages.assetArchiveMessage),
      okText: formatMessage(messages.assetArchiveOk),
      cancelText: formatMessage(messages.assetArchiveCancel),
      onOk: () => {
        this.archiveAssetList(asset.id).then(() => {
          if (data.length === 1 && filter.currentPage !== 1) {
            const newFilter = {
              ...filter,
              currentPage: filter.currentPage - 1,
            };
            history.replace(
              {
                pathname: pathname,
                search: updateSearch(search, newFilter),
              },
              state,
            );
            return Promise.resolve();
          }
          return this.fetchAssetList(organisationId, filter);
        });
      },
      onCancel: () => {
        // cancel
      },
    });
  };

  render() {
    const {
      intl: { formatMessage },
    } = this.props;

    const actionsColumnsDefinition: Array<ActionsColumnDefinition<AssetFileResource>> = [
      {
        key: 'action',
        actions: () => [
          {
            message: formatMessage(messages.archive),
            callback: this.onClickArchive,
          },
        ],
      },
    ];

    const dataColumnsDefinition: Array<DataColumnDefinition<AssetFileResource>> = [
      {
        title: formatMessage(messages.preview),
        key: 'path',
        isHideable: false,
        className: 'mcs-table-image-col',
        render: (text: string, record: AssetFileResource) => (
          <div className='mcs-table-cell-thumbnail'>
            <a
              target='_blank'
              rel='noreferrer noopener'
              href={`${(global as any).window.MCS_CONSTANTS.ASSETS_URL}${text}`}
            >
              <span className='thumbnail-helper' />
              <img
                src={`${(global as any).window.MCS_CONSTANTS.ASSETS_URL}${text}`}
                alt={record.original_name}
              />
            </a>
          </div>
        ),
      },
      {
        title: formatMessage(messages.name),
        key: 'original_name',
        isHideable: false,
        render: (text: string, record: AssetFileResource) => (
          <a
            href={`${(global as any).window.MCS_CONSTANTS.ASSETS_URL}${record.path}`}
            rel='noreferrer noopener'
            target='_blank'
          >
            {text}
          </a>
        ),
      },
      {
        title: formatMessage(messages.type),
        key: 'mime_type',
        isHideable: false,
        render: (text: string) => <span>{text}</span>,
      },
      {
        title: formatMessage(messages.dimensions),
        key: 'width',
        isHideable: false,
        render: (text: string, record: AssetFileResource) => (
          <span>
            {text}x{record.height}
          </span>
        ),
      },
    ];

    const emptyTable: {
      iconType: McsIconType;
      message: string;
    } = {
      iconType: 'library',
      message: this.props.intl.formatMessage(messages.empty),
    };

    return (
      <div className='ant-layout'>
        <AssetListActionBar onUploadDone={this.fetchAssetList} />
        <div className='ant-layout'>
          <Content className='mcs-content-container'>
            <ItemList
              fetchList={this.fetchAssetList}
              dataSource={this.state.data}
              loading={this.state.loading}
              total={this.state.total}
              columns={dataColumnsDefinition}
              actionsColumnsDefinition={actionsColumnsDefinition}
              pageSettings={PAGINATION_SEARCH_SETTINGS}
              emptyTable={emptyTable}
            />
          </Content>
        </div>
      </div>
    );
  }
}

export default compose(withRouter, injectIntl)(AssetListContent);
