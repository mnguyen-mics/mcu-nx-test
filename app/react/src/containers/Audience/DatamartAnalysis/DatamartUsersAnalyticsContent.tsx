import * as React from 'react';
// import UsersByTimeOfDay from './components/UsersByTimeOfDay';
import { Responsive, WidthProvider, Layout } from 'react-grid-layout';
import _ from 'lodash';
import ApiQueryWrapper from './components/helpers/ApiQueryWrapper';
import CardFlex from '../Dashboard/Components/CardFlex';
import { Chart } from '../../../models/datamartUsersAnalytics/datamartUsersAnalytics';
import { generateYAxisGridLine, generateXAxisGridLine, generateTooltip } from '../../../components/Charts/domain';

const ResponsiveGridLayout = WidthProvider(Responsive);

export interface Component {
  title: string;
  layout: Layout;
  charts: Chart[];
  datamartId: string;
}

interface State {
  dashboardConfig: DashboardConfig[]
}

interface DashboardConfig {
  title: string;
  layout: Layout;
  charts: Chart[];

}
interface DatamartUsersAnalyticsContentProps {
  datamartId: string;
}

class DatamartUsersAnalyticsContent extends React.Component<DatamartUsersAnalyticsContentProps, State> {
  constructor(props: DatamartUsersAnalyticsContentProps) {
    super(props);
    this.state = {
      dashboardConfig: []
    };
  }

  generateDOM(dashboardConfig: DashboardConfig[], datamartId: string) {
    return _.map(dashboardConfig, (comp: Component, i: number) => {
      return (
        <CardFlex
          title={comp.title}
          key={i.toString()}
          className={comp.layout.static ? 'static' : ''}
        >
          <ApiQueryWrapper charts={comp.charts} datamartId={datamartId} />
        </CardFlex>
      );
    });
  }

  componentDidMount() {
    // In the future this config should be stored and retrieved from an api
    const dashboardJsonConfig = [
      {
        title: 'Session in time',
        layout: {
          "i": "1",
          "h": 3,
          "static": false,
          "w": 6,
          "x": 0,
          "y": 6
        },
        charts: [
          {
            type: 'AREA',
            options: {
              title: undefined,
              height: 300,
              colors: ['#2fa1de'],
              credits: {
                enabled: false
              },
              chart: {
                reflow: true
              },
              xAxis: {
                ...generateXAxisGridLine(),
                type: 'datetime',
                dateTimeLabelFormats: {
                  day: '%d %b %Y'    // ex- 01 Jan 2016
                },
                title: {
                  text: null
                }
              },
              time: { timezoneOffset: -60, useUTC: true },
              yAxis: {
                ...generateYAxisGridLine(),
                title: {
                  text: null
                }
              },
              legend: {
                enabled: false
              }
            },
            tooltip: {
              shared: true,
              ...generateTooltip()
            },
            xKey: 'date_yyyymmdd',
            metricName: 'sessions'
          }
        ]
      }
    ];

    this.setState({
      dashboardConfig: dashboardJsonConfig as any
    })
  }

  render() {
    const { datamartId } = this.props;
    const { dashboardConfig } = this.state;

    const layouts = dashboardConfig.map((cl, i) => ({ ...cl.layout, i: i.toString() }));
    return (
      <ResponsiveGridLayout className="layout"
        layouts={{ lg: layouts }}
        cols={{ lg: 12, md: 12, sm: 12, xs: 12, xxs: 12 }}
        isDraggable={false}
        isResizable={false}
        measureBeforeMount={false}>
        {
          this.generateDOM(dashboardConfig, datamartId)
        }
      </ResponsiveGridLayout>
    );
  }
}

export default DatamartUsersAnalyticsContent;
