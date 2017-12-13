import * as React from 'react';
import { withRouter, RouteComponentProps } from 'react-router';

import { EmptyTableView, TableViewFilters } from './TableView';
import { ColumnsDefinitions } from './TableView/TableView';
import { FormattedMessage } from 'react-intl';
import { McsIconType } from './McsIcons';
import {
  buildDefaultSearch,
  compareSearches,
  isSearchValid,
  parseSearch,
  updateSearch,
} from '../utils/LocationSearchHelper';

export interface Filters {
  currentPage?: number;
  pageSize?: number;
  label_id?: string[];
  status?: string[];
}

interface ActionProps {
  fetchList: (organisationId: string, filter: Filters, isInitialFetch?: boolean) => void;
  resetList: () => void;
}

interface RouterParams {
  organisationId: string;
}

interface PageSetting {
  paramName: string;
  defaultValue: number;
  deserialize: (query: any) => number;
  serialize: (value: string | string[] | number) => string;
  isValid: (query: any) => boolean;
}

interface EmptyTableProps {
  iconType: McsIconType;
  intlMessage: FormattedMessage.Props;
}

interface ItemListProps {
  actions: ActionProps;
  dataSource: Array<{}>;
  isLoading: boolean;
  total: number;
  columnsDefinitions: ColumnsDefinitions;
  pageSettings: PageSetting[];
  emptyTable: EmptyTableProps;
}

type ItemListProvidedProps = ItemListProps & RouteComponentProps<RouterParams>;

class ItemList extends React.Component<ItemListProvidedProps> {

  componentDidMount() {
    const {
      actions: { fetchList },
      history,
      location: { search, pathname },
      match: { params: { organisationId } },
      pageSettings,
    } = this.props;

    if (!isSearchValid(search, pageSettings)) {
      history.replace({
        pathname: pathname,
        search: buildDefaultSearch(search, pageSettings),
        state: { reloadDataSource: true },
      });
    } else {
      const filter = parseSearch(search, pageSettings);

      fetchList(organisationId, filter, true);
    }
  }

  componentWillReceiveProps(nextProps: ItemListProvidedProps) {
    const {
      actions: { fetchList },
      history,
      location: {
        search,
      },
      match: {
        params: {
          organisationId,
        },
      },
    } = this.props;

    const {
      location: {
        pathname: nextPathname,
        search: nextSearch,
      },
      match: {
        params: {
          organisationId: nextOrganisationId,
        },
      },
      pageSettings,
    } = nextProps;

    if (!compareSearches(search, nextSearch) || organisationId !== nextOrganisationId) {
      if (!isSearchValid(nextSearch, pageSettings)) {
        history.replace({
          pathname: nextPathname,
          search: buildDefaultSearch(nextSearch, pageSettings),
          state: { reloadDataSource: organisationId !== nextOrganisationId },
        });
      } else {
        const filter = parseSearch(nextSearch, pageSettings);
        fetchList(nextOrganisationId, filter, false);
      }
    }
  }

  componentWillUnmount() {
    this.props.actions.resetList();
  }

  updateLocationSearch = (params: Filters) => {
    const {
      history,
      location: { search: currentSearch, pathname },
      pageSettings,
    } = this.props;

    const nextLocation = {
      pathname,
      search: updateSearch(currentSearch, params, pageSettings),
    };

    history.push(nextLocation);
  }

  render() {
    const {
      columnsDefinitions,
      dataSource,
      isLoading,
      total,
      location: { search },
      pageSettings,
      emptyTable: {
        iconType,
        intlMessage,
      },
    } = this.props;

    if (!dataSource.length && !isLoading) {
      return <EmptyTableView iconType={iconType} intlMessage={intlMessage} />;
    }

    const filter = parseSearch(search, pageSettings);
    const pagination = {
      current: filter.currentPage,
      pageSize: filter.pageSize,
      onChange: (page: number) =>
        this.updateLocationSearch({
          currentPage: page,
        }),
      onShowSizeChange: (current: number, size: number) =>
        this.updateLocationSearch({
          pageSize: size,
        }),
      total,
    };

    return (
      <div className="mcs-table-container">
        <TableViewFilters
          columnsDefinitions={columnsDefinitions}
          dataSource={dataSource}
          loading={isLoading}
          pagination={pagination}
        />
      </div>
    );
  }
}

export default withRouter(ItemList) as React.ComponentClass<ItemListProps>;
