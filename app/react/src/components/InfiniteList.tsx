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
});

const InputSearch = Input.Search;

export interface InfiniteListFilters {
  page: number;
  pageSize: number;
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
  hasMore: boolean;
  first: number;
  size: number;
  searchValue: string;
}

class InfiniteList<T> extends React.Component<Props<T>, State<T>> {
  constructor(props: Props<T>) {
    super(props);
    this.state = {
      data: [],
      loading: false,
      hasMore: true,
      first: 0,
      size: 8,
      searchValue: ''
    };
  }

  componentDidMount() {
    this.handleInfiniteOnLoad();
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
    this.props
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

  onSearch = () => {
    const { searchValue } = this.state;
    this.props.fetchData()
  }

  render() {
    const { intl } = this.props;
    const { data, loading, hasMore, searchValue } = this.state;
    return (
      <div className="infinite-container">
        <InfiniteScroll
          initialLoad={false}
          loadMore={this.handleInfiniteOnLoad}
          hasMore={!loading && hasMore}
          useWindow={false}
        >
          <InputSearch
          value={searchValue}
            placeholder={intl.formatMessage(messages.searchBarPlaceholder)}
            onSearch={}
          />
          <List dataSource={data} renderItem={this.renderItem}>
            {loading &&
              hasMore && (
                <div className="infinite-loading-container">
                  <Spin />
                </div>
              )}
          </List>
        </InfiniteScroll>
      </div>
    );
  }
}

export default compose<Props, InfiniteListProps>(
  withRouter,
  injectIntl,
)(InfiniteList);
