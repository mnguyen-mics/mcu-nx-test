import * as React from 'react';
import { Loading } from '@mediarithmics-private/mcs-components-library';
import { lazyInject } from '../../config/inversify.config';
import { TYPES } from '../../constants/types';
import { IChartService } from '../../services/ChartsService';
import { ChartResource } from '../../models/chart/Chart';
import Search from 'antd/lib/input/Search';
import { List } from 'antd';
import { compose } from 'recompose';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../containers/Notifications/injectNotifications';
import { InjectedIntlProps, injectIntl, defineMessages } from 'react-intl';
import {
  AreaChartOutlined,
  BarChartOutlined,
  BorderlessTableOutlined,
  PieChartOutlined,
  RadarChartOutlined,
  TableOutlined,
} from '@ant-design/icons';
import {
  TYPES as ATYPES,
  IUsersService,
  lazyInject as lazyInjectA,
} from '@mediarithmics-private/advanced-components';
import { DataListResponse } from '@mediarithmics-private/advanced-components/lib/services/ApiService';
import UserResource from '@mediarithmics-private/advanced-components/lib/models/directory/UserResource';
import { ChartType } from '@mediarithmics-private/advanced-components/lib/services/ChartDatasetService';
import _ from 'lodash';

const messages = defineMessages({
  modifiedBy: {
    id: 'components.chartsSearchPanel.modifiedBy',
    defaultMessage: 'Modified by',
  },
  daysAgo: {
    id: 'components.chartsSearchPanel.daysAgo',
    defaultMessage: 'days ago',
  },
  loadAChart: {
    id: 'components.chartsSearchPanel.loadAChart',
    defaultMessage: 'Load a chart',
  },
});

export interface ChartsSearchPanelProps {
  organisationId: string;
  onItemClick?: (item: ChartResource) => void;
  chartItem?: ChartResource;
}

export interface State {
  isLoading: boolean;
  charts: ChartResource[];
  usersMap: Map<string, UserResource>;
}

type Props = ChartsSearchPanelProps & InjectedIntlProps & InjectedNotificationProps;

class ChartsSearchPanel extends React.Component<Props, State> {
  @lazyInject(TYPES.IChartService)
  private _chartService: IChartService;

  @lazyInjectA(ATYPES.IUsersService)
  private _usersService: IUsersService;

  constructor(props: Props) {
    super(props);
    this.state = {
      isLoading: true,
      charts: [],
      usersMap: new Map(),
    };
    this.fetchData();
  }

  componentDidUpdate(prevProps: Props) {
    const { chartItem } = this.props;
    const { chartItem: prevChartItem } = prevProps;
    if (!_.isEqual(chartItem, prevChartItem) && !chartItem) {
      this.fetchData();
    }
  }

  daysBetween = (startDate: Date, endDate: Date) => {
    const oneDay = 1000 * 60 * 60 * 24;

    return Math.round((endDate.getTime() - startDate.getTime()) / oneDay);
  };

  getIconByType = (type: ChartType | undefined, className?: string) => {
    if (type) {
      switch (type) {
        case 'pie':
          return <PieChartOutlined className={className} />;
        case 'bars':
          return <BarChartOutlined className={className} />;
        case 'radar':
          return <RadarChartOutlined className={className} />;
        case 'area':
          return <AreaChartOutlined className={className} />;
        case 'metric':
          return <BorderlessTableOutlined className={className} />;
        default:
          return <TableOutlined className={className} />;
      }
    } else return <TableOutlined className={className} />;
  };

  fetchData = async (searchValue?: string) => {
    const { organisationId } = this.props;
    const { usersMap } = this.state;
    const filters = searchValue && searchValue.length > 0 ? { title: searchValue } : undefined;
    const charts = await this.fetchCharts(organisationId, filters);
    const userIds =
      charts !== undefined
        ? charts.map(chart => chart.last_modified_by).filter(userId => userId !== undefined)
        : [];

    const uniqueUserIds = Array.from(new Set(userIds));

    const updatedUsersMap = new Map(usersMap);
    for (const userId of uniqueUserIds) {
      const user = await this.fetchUser(userId);
      if (user !== undefined) updatedUsersMap.set(user.id, user);
    }
    this.setState({
      isLoading: false,
      charts: charts,
      usersMap: updatedUsersMap,
    });
  };

  fetchCharts = async (organisationId: string, filters?: object): Promise<ChartResource[]> => {
    const { notifyError } = this.props;
    return this._chartService
      .getCharts(organisationId, { ...filters, order_by: '-last_modified_ts' })
      .then(result => result.data)
      .catch(err => {
        notifyError(err);
        return [];
      });
  };

  fetchUser = async (userId?: string): Promise<UserResource | undefined> => {
    const { notifyError } = this.props;
    const { usersMap } = this.state;

    if (userId) {
      if (usersMap.has(userId)) return usersMap.get(userId);
      else {
        const userResponse: DataListResponse<UserResource> = await this._usersService
          .getUsersByKeyword(userId)
          .catch(e => {
            notifyError(e);
            return {
              data: [],
              count: 0,
              status: 'error',
            };
          });
        const user = userResponse.data.find(userResource => userResource.id === userId);

        return user;
      }
    } else return undefined;
  };

  onSearch = (value: string) => {
    this.setState({
      isLoading: true,
    });
    this.fetchData(value);
  };

  renderItem = (item: ChartResource) => {
    const { onItemClick, intl } = this.props;
    const { usersMap } = this.state;

    let userName: string | undefined;
    if (item.last_modified_by) {
      if (usersMap.has(item.last_modified_by)) {
        const user = usersMap.get(item.last_modified_by);
        if (user) userName = `${user.first_name} ${user.last_name}`;
      } else userName = item.last_modified_by;
    }

    const onClick = onItemClick
      ? () => {
          onItemClick(item);
        }
      : undefined;

    return (
      <div className='mcs-charts-list-item' onClick={onClick}>
        <span className='mcs-charts-list_title'>{item.title}</span>
        <span>
          <span className='mcs-charts-list-item_author'>
            {userName ? `${intl.formatMessage(messages.modifiedBy)} ${userName}` : ''}
          </span>
          <span className='mcs-charts-list-item_date'>
            {item.last_modified_ts
              ? `${this.daysBetween(
                  new Date(item.last_modified_ts),
                  new Date(),
                )} ${intl.formatMessage(messages.daysAgo)}`
              : ''}
          </span>
        </span>
        {this.getIconByType(item.type, 'mcs-charts-list-item_icon')}
      </div>
    );
  };

  render() {
    const { intl } = this.props;
    const { isLoading, charts } = this.state;

    return (
      <div className='mcs-charts-search-panel'>
        <div className='mcs-charts-search-panel_title'>
          {intl.formatMessage(messages.loadAChart)}
        </div>
        <Search
          className='mcs-charts-search-panel_search-bar'
          placeholder='Search'
          onSearch={this.onSearch}
        />
        {isLoading && <Loading isFullScreen={true} />}
        {!isLoading && (
          <List itemLayout='horizontal' dataSource={charts} renderItem={this.renderItem} />
        )}
      </div>
    );
  }
}

export default compose<ChartsSearchPanelProps, ChartsSearchPanelProps>(
  injectNotifications,
  injectIntl,
)(ChartsSearchPanel);
