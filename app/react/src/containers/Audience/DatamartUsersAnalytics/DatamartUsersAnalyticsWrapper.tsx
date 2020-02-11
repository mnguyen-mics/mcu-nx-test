import * as React from 'react';
import { Layout } from 'react-grid-layout';
import DatamartUsersAnalyticsContent, { DashboardConfig } from './DatamartUsersAnalyticsContent';

interface DatamartAnalysisProps {
  title?: string;
  datamartId: string;
  config: DashboardConfig[];
}

interface State {
  layout: Layout[];
}

type Props = DatamartAnalysisProps;

class DatamartUsersAnalyticsWrapper extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { layout: [] };
    this.onLayoutChange = this.onLayoutChange.bind(this);
  }

  onLayoutChange(layout: Layout[]) {
    this.setState({ layout: layout });
  }

  render() {
    const { title, datamartId, config } = this.props;
    return (
      <div>
        {
          title && <div>
            <div className={'mcs-datamartUsersAnalytics_title'}>{title}</div>
            <div className={'mcs-datamartUsersAnalytics_subTitle'}>Discover how your segment user interacts with your channels</div>
          </div>}
        <DatamartUsersAnalyticsContent datamartId={datamartId} config={config} />
      </div>
    );
  }
}

export default DatamartUsersAnalyticsWrapper;
