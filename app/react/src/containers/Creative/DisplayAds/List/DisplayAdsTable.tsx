import * as React from 'react';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import { Link, withRouter } from 'react-router-dom';
import { RouteComponentProps } from 'react-router';
import { compose } from 'recompose';
import {
  TableViewFilters,
} from '../../../../components/TableView';
import { CREATIVE_DISPLAY_SEARCH_SETTINGS } from './constants';
import {
  updateSearch,
  parseSearch,
} from '../../../../utils/LocationSearchHelper';
import CreativeScreenshot from '../../CreativeScreenshot';
import messages from './message';
import { CampaignRouteParams } from '../../../../models/campaign/CampaignResource';
import { DisplayAdResource } from '../../../../models/creative/CreativeResource';
import {
  ExtendedTableRowSelection,
  ActionsColumnDefinition,
} from '../../../../components/TableView/TableView';
import { EmptyTableView } from '@mediarithmics-private/mcs-components-library';

interface DisplayAdsTableProps {
  rowSelection: ExtendedTableRowSelection;
  isUpdatingAuditStatus: boolean;
  dataSource: DisplayAdResource[];
  archiveDisplayAd: (ad: DisplayAdResource) => void;
  hasDisplayAds: boolean;
  isLoadingDisplayAds: boolean;
  totalDisplayAds: number;
}

type JoinedProps = DisplayAdsTableProps &
  RouteComponentProps<CampaignRouteParams> &
  InjectedIntlProps;

class DisplayAdsTable extends React.Component<JoinedProps> {

  constructor(props: JoinedProps) {
    super(props);
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

  editDisplayCreative = (creative: DisplayAdResource) => {
    const {
      match: {
        params: { organisationId },
      },
      history,
    } = this.props;

    history.push(
      `/v2/o/${organisationId}/creatives/display/edit/${creative.id}`,
    );
  }

  render() {
    const {
      match: {
        params: { organisationId },
      },
      dataSource,
      isLoadingDisplayAds,
      location: { search },
      rowSelection,
      isUpdatingAuditStatus,
      totalDisplayAds,
      intl,
      hasDisplayAds,
      archiveDisplayAd,
    } = this.props;

    const filter = parseSearch(search, CREATIVE_DISPLAY_SEARCH_SETTINGS);

    const searchOptions = {
      placeholder: intl.formatMessage(messages.creativeModalSearchPlaceholder),
      onSearch: (value: string) =>
        this.updateLocationSearch({
          keywords: value,
          currentPage: 1,
        }),
      defaultValue: filter.keywords,
    };

    const pagination = {
      current: filter.currentPage,
      pageSize: filter.pageSize,
      total: totalDisplayAds,
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
        intlMessage: messages.preview,
        key: 'asset_path',
        isHideable: false,
        className: 'mcs-table-image-col',
        render: (text: string, record: DisplayAdResource) => (
          <CreativeScreenshot item={record} />
        ),
      },
      {
        intlMessage: messages.name,
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
        intlMessage: messages.auditStatus,
        key: 'audit_status',
        isHideable: false,
        render: (text: string) => <span>{text}</span>,
      },
      {
        intlMessage: messages.publishedVersion,
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
            intlMessage: messages.edit,
            callback: this.editDisplayCreative,
          },
          {
            intlMessage: messages.archive,
            callback: archiveDisplayAd,
          },
        ],
      },
    ];

    return hasDisplayAds ? (
      <div className="mcs-table-container">
        <TableViewFilters
          columns={dataColumns}
          actionsColumnsDefinition={actionColumns}
          dataSource={dataSource}
          loading={isLoadingDisplayAds || isUpdatingAuditStatus}
          pagination={pagination}
          rowSelection={rowSelection}
          searchOptions={searchOptions}
        />
      </div>
    ) : (
      <EmptyTableView iconType="display" message={intl.formatMessage(messages.noDisplayCreative)} />
    );
  }
}

export default compose<JoinedProps, DisplayAdsTableProps>(
  withRouter,
  injectIntl,
)(DisplayAdsTable);
