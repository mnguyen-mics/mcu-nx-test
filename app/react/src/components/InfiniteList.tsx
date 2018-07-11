import * as React from 'react';
import { compose } from 'recompose';
import { List, Spin, Input } from 'antd';
import InfiniteScroll from 'react-infinite-scroller';
import { RouteComponentProps, withRouter } from 'react-router';
import { DataListResponse } from '../services/ApiService';
import ButtonStyleless from '../components/ButtonStyleless';
import { injectIntl, InjectedIntlProps, defineMessages } from 'react-intl';

const messages = defineMessages({
  searchBarPlaceholder: {
    id: 'settings.services.infinite.scroll.searchBar.placeholder',
    defaultMessage: 'Enter your search here',
  },
  loadingSearchBarPlaceholder: {
    id: 'settings.services.infinite.scroll.loading.data.searchBar.placeholder',
    defaultMessage: 'Loading, please wait....',
  },
});

const InputSearch = Input.Search;

export interface InfiniteListFilters {
  page: number;
  pageSize: number;
  keywords?: string;
}

interface InfiniteListProps<T = any> {
  fetchData: (
    organisationId: string,
    filter: InfiniteListFilters,
  ) => Promise<DataListResponse<T>>;
  onItemClick: (item: T) => void;
  getItemKey: (item: T) => string | number;
  getItemTitle: (item: T) => React.ReactNode;
}

type Props<T = any> = InfiniteListProps<T> &
  InjectedIntlProps &
  RouteComponentProps<{ organisationId: string }>;

interface State<T> {
  data: T[];
  loading: boolean;
  initialLoading: boolean;
  hasMore: boolean;
  first: number;
  size: number;
}

const initialPage = 0;
const initialPageSize = 12;

class InfiniteList<T> extends React.Component<Props<T>, State<T>> {
  constructor(props: Props<T>) {
    super(props);
    this.state = {
      data: [],
      loading: false,
      initialLoading: false,
      hasMore: true,
      first: initialPage,
      size: initialPageSize,
    };
  }

  componentDidMount() {
    this.setState({
      initialLoading: true,
    });
    this.handleInfiniteOnLoad().then(() => {
      this.setState({
        initialLoading: false,
      });
    });
  }

  handleInfiniteOnLoad = () => {
    const {
      match: {
        params: { organisationId },
      },
    } = this.props;

    const { data, first, size } = this.state;

    this.setState({
      loading: true,
    });
    const prevData = data;
    return this.props
      .fetchData(organisationId, { page: first, pageSize: size })
      .then(res => {
        this.setState({
          data: prevData.concat(res.data),
          loading: false,
          hasMore: res.data.length === size,
          first: first + size,
        });
      });
  };

  renderItem = (item: any) => {
    const { onItemClick, getItemKey, getItemTitle } = this.props;
    return (
      <List.Item key={getItemKey(item)}>
        <ButtonStyleless
          onClick={onItemClick(item)}
          style={{ textAlign: 'left' }}
        >
          <List.Item.Meta title={getItemTitle(item)} />
        </ButtonStyleless>
      </List.Item>
    );
  };

  onSearch = (searchValue: string) => {
    const {
      match: {
        params: { organisationId },
      },
    } = this.props;

    this.props
      .fetchData(organisationId, {
        page: initialPage,
        pageSize: initialPageSize,
        keywords: searchValue,
      })
      .then(res => {
        this.setState({
          data: res.data,
          loading: false,
          hasMore: res.data.length === initialPageSize,
          first: initialPageSize + 1,
        });
      });
  };

  render() {
    const { intl } = this.props;
    const { data, loading, hasMore, initialLoading } = this.state;
    return (
      <div className="infinite-container" style={{ maxHeight: '600px' }}>
        <InfiniteScroll
          initialLoad={false}
          loadMore={this.handleInfiniteOnLoad}
          hasMore={!loading && hasMore}
          useWindow={false}
        >
          {initialLoading ? (
            <div>
              <InputSearch
                placeholder={intl.formatMessage(
                  messages.loadingSearchBarPlaceholder,
                )}
                className="infinite-scroll-searchbar"
                disabled={true}
              />
              <div className="infinite-loading-container">
                <Spin />
              </div>
            </div>
          ) : (
            <div>
              <InputSearch
                placeholder={intl.formatMessage(messages.searchBarPlaceholder)}
                onSearch={this.onSearch}
                className="infinite-scroll-searchbar"
              />
              <List dataSource={data} renderItem={this.renderItem}>
                {loading &&
                  hasMore && (
                    <div className="infinite-loading-container">
                      <Spin />
                    </div>
                  )}
              </List>
            </div>
          )}
        </InfiniteScroll>
      </div>
    );
  }
}

export default compose<Props, InfiniteListProps>(
  withRouter,
  injectIntl,
)(InfiniteList);
