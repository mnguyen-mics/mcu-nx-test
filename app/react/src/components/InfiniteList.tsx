import * as React from 'react';
import { compose } from 'recompose';
import { List, Spin, Input } from 'antd';
import InfiniteScroll from 'react-infinite-scroller';
import { RouteComponentProps, withRouter } from 'react-router';
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
  page?: number;
  pageSize?: number;
  keywords?: string;
}

interface InfiniteListProps<T = any> {
  fetchData: (
    organisationId: string,
    offerId: string,
    filter: InfiniteListFilters,
  ) => Promise<any>;
  renderItem: (item: T) => React.ReactNode;
  storeItemData: (item: T) => void;
}

type Props<T = any> = InfiniteListProps<T> &
  InjectedIntlProps &
  RouteComponentProps<{ organisationId: string; offerId: string }>;

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
      const { data } = this.state;
      if (data[0]) {
        this.props.storeItemData(data[0]);
      }
      this.setState({
        initialLoading: false,
      });
    });
  }

  handleInfiniteOnLoad = () => {
    const {
      match: {
        params: { organisationId, offerId },
      },
    } = this.props;

    const { data, first, size, loading } = this.state;

    if (!loading) {
      this.setState({
        loading: true,
      });
      const prevData = data;
      return this.props
        .fetchData(organisationId, offerId, { page: first, pageSize: size })
        .then(res => {
          this.setState({
            data: prevData.concat(res),
            loading: false,
            hasMore: res.length === size,
            first: first + size,
          });
        })
        .catch(err => {
          this.setState({
            loading: false,
          });
        });
    }
    return Promise.resolve();
  };

  onSearch = (searchValue: string) => {
    const {
      match: {
        params: { organisationId, offerId },
      },
    } = this.props;

    this.props
      .fetchData(organisationId, offerId, {
        keywords: searchValue,
      })
      .then(res => {
        this.setState({
          data: res,
          loading: false,
          hasMore: res.length === initialPageSize,
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
              <List
                dataSource={data}
                renderItem={this.props.renderItem}
                className="infinite-list"
              >
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
