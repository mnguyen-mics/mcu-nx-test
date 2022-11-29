import * as React from 'react';
import DashboardContent from './DashboardContent';
import { Layout, Layouts } from 'react-grid-layout';
import { ContentHeader } from '@mediarithmics-private/mcs-components-library';
import { DashboardWrapperProps } from '@mediarithmics-private/advanced-components/lib/models/dashboards/dashboardsModel';

interface State {
  layout: Layout[];
}

type Props = DashboardWrapperProps;

class DashboardWrapper extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { layout: [] };
    this.onLayoutChange = this.onLayoutChange.bind(this);
  }

  onLayoutChange(layout: Layout[], allLayouts: Layouts) {
    this.setState({ layout: layout });
  }

  render() {
    const { source, layout, title, datamartId, queryExecutionSource, queryExecutionSubSource } =
      this.props;

    return (
      <div>
        {title && <ContentHeader title={title} size={source ? 'medium' : `large`} />}
        <DashboardContent
          layout={layout}
          onLayoutChange={this.onLayoutChange}
          source={source}
          datamartId={datamartId}
          queryExecutionSource={queryExecutionSource}
          queryExecutionSubSource={queryExecutionSubSource}
        />
      </div>
    );
  }
}

export default DashboardWrapper;
