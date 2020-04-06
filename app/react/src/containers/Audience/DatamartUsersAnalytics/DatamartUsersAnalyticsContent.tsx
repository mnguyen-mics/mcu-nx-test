import * as React from 'react';
import { Responsive, WidthProvider, Layout } from 'react-grid-layout';
import ApiQueryWrapper from './components/helpers/ApiQueryWrapper';
import CardFlex from '../Dashboard/Components/CardFlex';
import { Chart } from '../../../models/datamartUsersAnalytics/datamartUsersAnalytics';
import { McsDateRangeValue } from '../../../components/McsDateRangePicker';
import { parseSearch } from '../../../utils/LocationSearchHelper';
import { DATAMART_USERS_ANALYTICS_SETTING } from '../Segments/Dashboard/constants';
import { withRouter, RouteComponentProps } from 'react-router';
import { compose } from 'recompose';
import chroma from 'chroma-js';
import injectThemeColors, {
  InjectedThemeColorsProps,
} from '../../Helpers/injectThemeColors';
import { isEqual, difference } from 'lodash';
const ResponsiveGridLayout = WidthProvider(Responsive);

export interface DashboardConfig {
  title: string;
  layout: Layout;
  charts: Chart[];
  color: string;
  segments?: SegmentFilter;
}

interface SegmentFilter {
  baseSegmentId: string;
  segmentIdToCompareWith?: string;
}

interface DatamartUsersAnalyticsContentProps {
  datamartId: string;
  config: DashboardConfig[];
  dateRange: McsDateRangeValue;
  onChange: (isLoading: boolean) => void;
}

interface DatamartUsersAnalyticsContentStates {
  formattedConfig: DashboardConfig[];
  filters: string[];
  allUsers: boolean;
  filterColors: string[];
  allUsersFilterColor: string;
  lastFilterColor: string;
}

type JoinedProp = RouteComponentProps & DatamartUsersAnalyticsContentProps & InjectedThemeColorsProps;

class DatamartUsersAnalyticsContent extends React.Component<JoinedProp, DatamartUsersAnalyticsContentStates> {

  private _lastFilterColor = '#000';

  constructor(props: JoinedProp) {
    super(props);

    this.state = {
      formattedConfig: [],
      filters: [],
      allUsers: true,
      filterColors: [],
      allUsersFilterColor: props.colors['mcs-primary'],
      lastFilterColor: this._lastFilterColor
    }
  }

  componentDidMount() {
    const { config, colors } = this.props;
    const { allUsersFilterColor, lastFilterColor } = this.state;

    for (const configItem of config) {
      const currentConfigItem = { ...configItem };
      configItem.color = allUsersFilterColor;
      config.concat(currentConfigItem);
    }

    this.setState({
      formattedConfig: config,
      filterColors: chroma.scale([colors['mcs-info'], lastFilterColor]).mode('lch').colors(3)
    });
  }

  componentDidUpdate(previousProps: DatamartUsersAnalyticsContentProps) {
    const { location: { search }, config } = this.props;
    const { filters, allUsers, filterColors } = this.state;

    const filter = parseSearch(search, DATAMART_USERS_ANALYTICS_SETTING);

    if (!isEqual(filter.segments, filters)) {
      const tmpDashboardConfig: DashboardConfig[] = [];
      let newDashboardConfig: DashboardConfig[] = [];

      this.setState(state => {
        const formattedConfig = state.formattedConfig.slice();
        if (filters.length < filter.segments.length) {
          // Add segment filter
          for (const configItem of config) {
            const currentConfigItem = {
              ...configItem,
              segments: {
                baseSegmentId: filter.segments[filters.length]
              },
              color: filterColors[filters.length]
            };
            currentConfigItem.layout.y += 3;
            tmpDashboardConfig.push(currentConfigItem);
          }
          newDashboardConfig = formattedConfig.concat(tmpDashboardConfig);
        }
        else {
          const thedifference = difference(filters, filter.segments);
          // Remove segment filter
          newDashboardConfig = formattedConfig.filter(item => !item.segments || (item.segments && item.segments.baseSegmentId !== thedifference[0]));
        }

        return {
          formattedConfig: newDashboardConfig,
          filters: filter.segments
        }
      });
    }

    if (!isEqual(filter.allusers, allUsers)) {
      this.setState(state => {
        const formattedConfig = state.formattedConfig.slice();
        const newDashboardConfig = !filter.allusers ? formattedConfig.filter(item => item.segments) : formattedConfig.concat(config);
        return {
          formattedConfig: newDashboardConfig,
          allUsers: filter.allusers
        }
      });
    }
  }


  generateDOM(dashboardConfig: DashboardConfig[], datamartId: string, dateRange: McsDateRangeValue, onChange: (isLoading: boolean) => void) {
    return dashboardConfig.map((comp: DashboardConfig, i) => {
      return (
        <CardFlex
          title={comp.title}
          key={i.toString()}
          className={comp.layout.static ? 'static mcs-datamartUsersAnalytics_card' : 'mcs-datamartUsersAnalytics_card'}
          style={{ borderLeft: `5px solid ${comp.color}` }}
        >
          {comp.charts.map((chart: Chart, index) => {
            return <ApiQueryWrapper
              key={index.toString()}
              chart={chart}
              datamartId={datamartId}
              dateRange={dateRange}
              onChange={onChange}
              segmentId={comp.segments ? comp.segments.baseSegmentId : undefined}
              compareWithSegmentId={comp.segments ? comp.segments.segmentIdToCompareWith : undefined}
            />
          })}
        </CardFlex>
      );
    });
  }

  render() {
    const { formattedConfig } = this.state;
    const { datamartId, dateRange, onChange } = this.props;

    const layouts = formattedConfig.map((cl, i) => ({ ...cl.layout, i: i.toString() }));

    return (
      <ResponsiveGridLayout className="layout mcs-datamartUsersAnalytics_components"
        layouts={{ lg: layouts }}
        cols={{ lg: 12, md: 12, sm: 12, xs: 12, xxs: 12 }}
        isDraggable={false}
        isResizable={false}
        measureBeforeMount={false}>
        {
          this.generateDOM(formattedConfig, datamartId, dateRange, onChange)
        }
      </ResponsiveGridLayout>
    );
  }
}

export default compose<DatamartUsersAnalyticsContentProps, DatamartUsersAnalyticsContentProps>(
  withRouter,
  injectThemeColors
)(DatamartUsersAnalyticsContent);