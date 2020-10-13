import * as React from 'react';
import DashboardContent from './DashboardContent';
import { Layout, Layouts } from 'react-grid-layout';
import { ContentHeader } from '@mediarithmics-private/mcs-components-library';
import { ComponentLayout } from '../../../models/dashboards/dashboards';
import { AudienceSegmentShape } from '../../../models/audiencesegment';

interface DashboardWrapperProps {
  key?: any;
  layout: ComponentLayout[];
  title?: string;
  segment?: AudienceSegmentShape;
  datamartId: string;
}

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
    const { segment, layout, title, datamartId } = this.props;

    return (
      <div>
        <ContentHeader title={title} size={segment ? 'medium' : `large`} />
        <DashboardContent
          layout={layout}
          onLayoutChange={this.onLayoutChange}
          segment={segment}
          datamartId={datamartId}
        />
      </div>
    );
  }
}

export default DashboardWrapper;
