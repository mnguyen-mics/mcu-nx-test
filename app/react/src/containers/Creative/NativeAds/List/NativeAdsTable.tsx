import * as React from 'react';
import { withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { RouteComponentProps } from 'react-router';
import {
  TableViewFilters,
} from '../../../../components/TableView/index';
import { NATIVE_SEARCH_SETTINGS } from './constants';
import {
  updateSearch,
  parseSearch,
} from '../../../../utils/LocationSearchHelper';
import CreativeScreenshot from '../../CreativeScreenshot';
import { CampaignRouteParams } from '../../../../models/campaign/CampaignResource';
import { Filters } from '../../../../components/ItemList';
import { DisplayAdResource } from '../../../../models/creative/CreativeResource';
import {
  ExtendedTableRowSelection,
  ActionsColumnDefinition,
} from '../../../../components/TableView/TableView';
import messagesMap from '../../DisplayAds/List/message';
import { EmptyTableView } from '@mediarithmics-private/mcs-components-library';

interface NativeAdsTableProps {
  rowSelection: ExtendedTableRowSelection;
  hasNativeAds: boolean;
  isLoadingNativeAds: boolean;
  dataSource: DisplayAdResource[];
  totalNativeAds: number;
  archiveNativeAd: (ad: DisplayAdResource) => void;
}

interface State {
  modalVisible: boolean;
  inputValue: string[];
  selectedNativeId: string;
}

type JoinedProps = NativeAdsTableProps &
  RouteComponentProps<CampaignRouteParams> &
  InjectedIntlProps;

class NativeAdsTable extends React.Component<
  JoinedProps,
  State
> {
  constructor(props: JoinedProps) {
    super(props);
  }

  editNativeCreatives = (native: DisplayAdResource) => {
    const {
      match: {
        params: { organisationId },
      },
      history,
      location,
    } = this.props;

    history.push({
      pathname: `/v2/o/${organisationId}/creatives/native/edit/${native.id}`,
      state: { from: `${location.pathname}` },
    });
  }

  updateLocationSearch(params: Filters) {
    const {
      history,
      location: { search: currentSearch, pathname },
    } = this.props;

    const nextLocation = {
      pathname,
      search: updateSearch(currentSearch, params, NATIVE_SEARCH_SETTINGS),
    };

    history.push(nextLocation);
  }

  viewTestModal = (template: DisplayAdResource) => {
    this.setState({ modalVisible: true, selectedNativeId: template.id });
  };

  handleCancel = () => {
    this.setState({ modalVisible: false, selectedNativeId: '' });
  };

  render() {
    const {
      location: { search },
      rowSelection,
      intl,
      totalNativeAds,
      archiveNativeAd,
      hasNativeAds,
      dataSource,
      isLoadingNativeAds,
    } = this.props;

    const filter = parseSearch(search, NATIVE_SEARCH_SETTINGS);

    const pagination = {
      current: filter.currentPage,
      pageSize: filter.pageSize,
      total: totalNativeAds,
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
        intlMessage: messagesMap.preview,
        key: 'asset_path',
        isHideable: false,
        className: 'mcs-table-image-col',
        render: (
          text: string,
          record: any, // check type
        ) => <CreativeScreenshot item={record} />,
      },
      {
        intlMessage: messagesMap.name,
        key: 'name',
        isHideable: false,
        render: (text: string, record: any) => {
          const editLink = () => {
            this.editNativeCreatives(record);
          };

          return (
            <a className="mcs-campaigns-link" onClick={editLink}>
              {text}
            </a>
          );
        },
      },
      {
        intlMessage: messagesMap.auditStatus,
        key: 'audit_status',
        isHideable: false,
        render: (text: string) => <span>{text}</span>,
      },
      {
        intlMessage: messagesMap.publishedVersion,
        key: 'published_version',
        isHideable: false,
        render: (text: string) => <span>{text}</span>,
      },
    ];

    const actionColumns: Array<ActionsColumnDefinition<DisplayAdResource>> = [
      {
        key: 'action',
        actions: () => [
          {
            intlMessage: messagesMap.edit,
            callback: this.editNativeCreatives,
          },
          {
            intlMessage: messagesMap.archive,
            callback: archiveNativeAd,
          },
        ],
      },
    ];

    const searchOptions = {
      placeholder: intl.formatMessage(messagesMap.searchPlaceholder),
      onSearch: (value: string) =>
        this.updateLocationSearch({
          keywords: value,
          currentPage: 1,
        }),
      defaultValue: filter.keywords,
    };

    return hasNativeAds ? (
      <div className="mcs-table-container">
        <TableViewFilters
          columns={dataColumns}
          actionsColumnsDefinition={actionColumns}
          dataSource={dataSource}
          loading={isLoadingNativeAds}
          pagination={pagination}
          rowSelection={rowSelection}
          searchOptions={searchOptions}
        />
      </div>
    ) : (
      <EmptyTableView iconType="display" message={intl.formatMessage(messagesMap.noNativeCreative)} />
    );
  }
}

export default compose<JoinedProps, NativeAdsTableProps>(
  withRouter,
  injectIntl,
)(NativeAdsTable);
