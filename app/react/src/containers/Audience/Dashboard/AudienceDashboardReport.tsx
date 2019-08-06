import * as React from 'react';
import AudienceSegmentReport from './AudienceSegmentReport';
import { Layout, Layouts } from 'react-grid-layout';
import ContentHeader from '../../../components/ContentHeader';
import { UserQuerySegment } from '../../../models/audiencesegment/AudienceSegmentResource';
import { ComponentLayout } from './domain';

interface AudienceDashboardReportProps {
  layout: ComponentLayout[];
  title?: string;
  segment: UserQuerySegment;
}

interface State {
  layout: Layout[];
}

type Props = AudienceDashboardReportProps;

class AudienceDashboardReport extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { layout: [] };
    this.onLayoutChange = this.onLayoutChange.bind(this);
  }

  onLayoutChange(layout: Layout[], allLayouts: Layouts) {
    this.setState({ layout: layout });
  }

  render() {
    const { title, segment, layout } = this.props;
    return (
      <div>
        {title && <ContentHeader title={title} size={`medium`} />}
        <AudienceSegmentReport
          layout={layout}
          onLayoutChange={this.onLayoutChange}
          segment={segment}
        />
      </div>
    );
  }
}

export default AudienceDashboardReport;
