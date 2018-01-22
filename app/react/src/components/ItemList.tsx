import * as React from 'react';
import { withRouter, RouteComponentProps } from 'react-router';
import { compose } from 'recompose';

import { EmptyTableView, TableViewFilters } from './TableView';
import { FormattedMessage } from 'react-intl';
import { McsIconType } from './McsIcons';
import {
  buildDefaultSearch,
  compareSearches,
  isSearchValid,
  parseSearch,
  updateSearch,
} from '../utils/LocationSearchHelper';
import { ViewComponentWithFiltersProps } from './TableView/TableViewFilters';

export interface Filters {
  currentPage?: number;
  pageSize?: number;
  status?: string[];
}

interface RouterParams {
  organisationId: string;
}

export interface PageSetting {
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

export interface ItemListProps<T = any> extends ViewComponentWithFiltersProps<T> {
  fetchList: (organisationId: string, filter: Filters, isInitialFetch?: boolean) => void;
  dataSource: T[];
  total: number;
  pageSettings: PageSetting[];
  emptyTable: EmptyTableProps;
}

type Props<T = any> = ItemListProps<T> & RouteComponentProps<RouterParams>

class ItemList<T> extends React.Component<Props<T>> {

  componentDidMount() {
    const {
      fetchList,
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

  componentWillReceiveProps(nextProps: Props<T>) {
    const {
      fetchList,
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
      total,
      location: { search },
      pageSettings,
      emptyTable: {
        iconType,
        intlMessage,
      },
      ...rest,
    } = this.props;

    if (!rest.dataSource.length && !rest.loading) {
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
          currentPage: 1,
          pageSize: size,
        }),
      total,
    };

    return (
      <div className="mcs-table-container">
        <TableViewFilters
          pagination={pagination}
          {...rest}
        />
      </div>
    );
  }
}

export default compose<Props, ItemListProps>(
  withRouter,
)(ItemList);
