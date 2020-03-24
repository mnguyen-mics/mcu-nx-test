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

import { isEqual, difference } from 'lodash';
const ResponsiveGridLayout = WidthProvider(Responsive);

export interface DashboardConfig {
  title: string;
  layout: Layout;
  charts: Chart[];
  color: string;
  segmentId?: string;
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
}

type JoinedProp = RouteComponentProps & DatamartUsersAnalyticsContentProps;

class DatamartUsersAnalyticsContent extends React.Component<JoinedProp, DatamartUsersAnalyticsContentStates> {

  private _firstColor = '#00a1df';
  private _lastFilterColor = '#000';
  private _allUserFilterColor = '#003056';
  private _colors = chroma.scale([this._firstColor, this._lastFilterColor]).mode('lch').colors(3);

  constructor(props: JoinedProp) {
    super(props);

    this.state = {
      formattedConfig: [],
      filters: []
    }
  }

  componentDidMount() {
    const { config } = this.props;

    for (const configItem of config) {
      const currentConfigItem = {...configItem};
      configItem.color = this._allUserFilterColor;
      config.concat(currentConfigItem);
    }

    this.setState({
      formattedConfig: config
    });
  }

  componentDidUpdate() {
    const { location: { search }, config } = this.props;
    const { filters } = this.state;
    const filter = parseSearch(search, DATAMART_USERS_ANALYTICS_SETTING);
    if (!isEqual(filter.segments, filters)) {
      const tmpDashboardConfig = [] as DashboardConfig[];
      let newDashboardConfig = [] as DashboardConfig[];
      this.setState(state => {
        const formattedConfig = state.formattedConfig.slice();
        if (filters.length < filter.segments.length) {
          for (const configItem of config) {
            const currentConfigItem = {...configItem};
            currentConfigItem.layout.y += 3;
            currentConfigItem.color = this._colors[filters.length];
            currentConfigItem.segmentId = filter.segments[filters.length];
            tmpDashboardConfig.push(currentConfigItem);
          }
          newDashboardConfig = formattedConfig.concat(tmpDashboardConfig);
        }
        else {
          const thedifference = difference(filters, filter.segments);
          newDashboardConfig = formattedConfig.filter(item => item.segmentId !== thedifference[0]);
        }

        return {
          formattedConfig: newDashboardConfig,
          filters: filter.segments
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
                      segmentId={comp.segmentId} 
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

export default compose<DatamartUsersAnalyticsContentProps, DatamartUsersAnalyticsContentProps>(withRouter)(DatamartUsersAnalyticsContent)