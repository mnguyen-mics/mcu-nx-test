import * as React from 'react';
import { Responsive, WidthProvider, Layout } from 'react-grid-layout';
import ApiQueryWrapper from './components/helpers/ApiQueryWrapper';
import CardFlex from '../Dashboard/Components/CardFlex';
import { Chart } from '../../../models/datamartUsersAnalytics/datamartUsersAnalytics';
import { McsDateRangeValue } from '../../../components/McsDateRangePicker';

const ResponsiveGridLayout = WidthProvider(Responsive);

export interface Component {
  title: string;
  layout: Layout;
  charts: Chart[];
  datamartId: string;
}


export interface DashboardConfig {
  title: string;
  layout: Layout;
  charts: Chart[];
}

interface DatamartUsersAnalyticsContentProps {
  datamartId: string;
  config: DashboardConfig[];
  dateRange: McsDateRangeValue;
  onChange: (isLoading: boolean) => void;
}

class DatamartUsersAnalyticsContent extends React.Component<DatamartUsersAnalyticsContentProps> {
  constructor(props: DatamartUsersAnalyticsContentProps) {
    super(props);
  }

  generateDOM(dashboardConfig: DashboardConfig[], datamartId: string, dateRange: McsDateRangeValue, onChange: (isLoading: boolean) => void) {
    return dashboardConfig.map((comp: Component, i) => {
      return (
        <CardFlex
          title={comp.title}
          key={i.toString()}
          className={comp.layout.static ? 'static mcs-datamartUsersAnalytics_card' : 'mcs-datamartUsersAnalytics_card'}
        >
          {comp.charts.map((chart: Chart, index) => {
            return <ApiQueryWrapper key={index.toString()} chart={chart} datamartId={datamartId} dateRange={dateRange} onChange={onChange}/>
          })}
        </CardFlex>
      );
    });
  }

  render() {
    const { datamartId, config, dateRange, onChange } = this.props;

    const layouts = config.map((cl, i) => ({ ...cl.layout, i: i.toString() }));

    return (
      <ResponsiveGridLayout className="layout mcs-datamartUsersAnalytics_components"
        layouts={{ lg: layouts }}
        cols={{ lg: 12, md: 12, sm: 12, xs: 12, xxs: 12 }}
        isDraggable={false}
        isResizable={false}
        measureBeforeMount={false}>
        {
          this.generateDOM(config, datamartId, dateRange, onChange)
        }
      </ResponsiveGridLayout>
    );
  }
}

export default DatamartUsersAnalyticsContent;
