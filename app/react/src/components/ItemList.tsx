import * as React from 'react';
import { withRouter, RouteComponentProps } from 'react-router';
import { compose } from 'recompose';
import {
  buildDefaultSearch,
  compareSearches,
  isSearchValid,
  parseSearch,
  updateSearch,
} from '../utils/LocationSearchHelper';
import { EmptyTableView, TableViewFilters } from '@mediarithmics-private/mcs-components-library';
import { McsIconType } from '@mediarithmics-private/mcs-components-library/lib/components/mcs-icon';
import { ViewComponentWithFiltersProps } from '@mediarithmics-private/mcs-components-library/lib/components/table-view-filters';

export interface Filters {
  currentPage?: number;
  pageSize?: number;
  status?: string[];
  keywords?: string;
  archived?: boolean;
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
  message: string;
}

export interface ItemListProps<T = any> extends ViewComponentWithFiltersProps<T> {
  fetchList: (organisationId: string, filters: Filters, isInitialFetch?: boolean) => void;
  dataSource: T[];
  total: number;
  pageSettings: PageSetting[];
  emptyTable: EmptyTableProps;
  additionnalComponent?: React.ReactNode;
}

type Props<T = any> = ItemListProps<T> & RouteComponentProps<RouterParams>;

class ItemList<T> extends React.Component<Props<T>> {
  componentDidMount() {
    const {
      fetchList,
      history,
      location: { search, pathname },
      match: {
        params: { organisationId },
      },
      pageSettings,
    } = this.props;

    if (!isSearchValid(search, pageSettings)) {
      history.replace({
        pathname: pathname,
        search: buildDefaultSearch(search, pageSettings),
        state: { reloadDataSource: true },
      });
    } else {
      const filters = parseSearch(search, pageSettings);

      fetchList(organisationId, filters, true);
    }
  }

  componentDidUpdate(previousProps: Props<T>) {
    const {
      fetchList,
      history,
      location: { pathname, search },
      match: {
        params: { organisationId },
      },
      pageSettings,
    } = this.props;

    const {
      location: { search: previousSearch },
      match: {
        params: { organisationId: previousOrganisationId },
      },
    } = previousProps;

    if (!compareSearches(search, previousSearch) || organisationId !== previousOrganisationId) {
      if (!isSearchValid(search, pageSettings)) {
        history.replace({
          pathname: pathname,
          search: buildDefaultSearch(search, pageSettings),
          state: { reloadDataSource: organisationId !== previousOrganisationId },
        });
      } else {
        const filters = parseSearch(search, pageSettings);
        fetchList(organisationId, filters, false);
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
  };

  render() {
    const {
      total,
      location: { search },
      pageSettings,
      emptyTable: { iconType, message },
      additionnalComponent,
      ...rest
    } = this.props;

    if (!rest.dataSource.length && !rest.loading && !additionnalComponent) {
      return <EmptyTableView iconType={iconType} message={message} />;
    }

    const filter = parseSearch(search, pageSettings);
    const pagination = {
      current: filter.currentPage,
      pageSize: filter.pageSize,
      onChange: (page: number, size: number) =>
        this.updateLocationSearch({
          currentPage: page,
          pageSize: size,
        }),
      onShowSizeChange: (current: number, size: number) =>
        this.updateLocationSearch({
          currentPage: 1,
          pageSize: size,
        }),
      total,
    };

    return (
      <div className='mcs-table-container'>
        {additionnalComponent}
        {!rest.dataSource.length && !rest.loading ? (
          <EmptyTableView
            iconType={iconType}
            message={message}
            className={`mcs-table-view-empty mcs-empty-card ${
              rest?.className ? rest.className : ''
            }`}
          />
        ) : (
          <TableViewFilters pagination={pagination} {...rest} />
        )}
      </div>
    );
  }
}

export default compose<Props, ItemListProps>(withRouter)(ItemList);
