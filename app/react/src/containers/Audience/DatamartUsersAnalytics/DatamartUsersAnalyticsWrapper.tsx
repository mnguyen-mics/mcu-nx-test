import * as React from 'react';
import { Layout } from 'react-grid-layout';
import ContentHeader from '../../../components/ContentHeader';
import DatamartAnalysisContent, { DashboardConfig } from './DatamartUsersAnalyticsContent';

interface DatamartAnalysisProps {
  title?: string;
  datamartId: string;
  config: DashboardConfig[];
}

interface State {
  layout: Layout[];
}

type Props = DatamartAnalysisProps;

class DatamartAnalysisWrapper extends React.Component<Props, State> {
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
        <ContentHeader title={title} size={`large`} />
        <DatamartAnalysisContent datamartId={datamartId} config={config} />
      </div>
    );
  }
}

export default DatamartAnalysisWrapper;
