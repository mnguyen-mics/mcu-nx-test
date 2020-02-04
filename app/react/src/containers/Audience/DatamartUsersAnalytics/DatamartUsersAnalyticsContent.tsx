import * as React from 'react';
import { Responsive, WidthProvider, Layout } from 'react-grid-layout';
import ApiQueryWrapper from './components/helpers/ApiQueryWrapper';
import CardFlex from '../Dashboard/Components/CardFlex';
import { Chart } from '../../../models/datamartUsersAnalytics/datamartUsersAnalytics';

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
}

class DatamartUsersAnalyticsContent extends React.Component<DatamartUsersAnalyticsContentProps> {
  constructor(props: DatamartUsersAnalyticsContentProps) {
    super(props);
  }

  generateDOM(dashboardConfig: DashboardConfig[], datamartId: string) {
    return dashboardConfig.map((comp: Component, i: number) => {
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

  render() {
    const { datamartId, config } = this.props;

    const layouts = config.map((cl, i) => ({ ...cl.layout, i: i.toString() }));
    return (
      <ResponsiveGridLayout className="layout"
        layouts={{ lg: layouts }}
        cols={{ lg: 12, md: 12, sm: 12, xs: 12, xxs: 12 }}
        isDraggable={false}
        isResizable={false}
        measureBeforeMount={false}>
        {
          this.generateDOM(config, datamartId)
        }
      </ResponsiveGridLayout>
    );
  }
}

export default DatamartUsersAnalyticsContent;
