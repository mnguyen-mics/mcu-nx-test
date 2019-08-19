import * as React from 'react';
import AudienceSegmentReport from './AudienceSegmentReport';
import { Layout, Layouts } from 'react-grid-layout';
import ContentHeader from '../../../components/ContentHeader';
import { UserQuerySegment, UserListSegment } from '../../../models/audiencesegment/AudienceSegmentResource';
import { ComponentLayout } from './domain';
import { Button } from 'antd';
import { FormattedMessage } from 'react-intl';

interface AudienceDashboardReportProps {
  layout: ComponentLayout[];
  title?: string;
  segment: UserQuerySegment | UserListSegment;
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

  handleSaveGridLayout = () => {
    //
  };

  getReportHeaderContent = () => {
    const { title } = this.props;
    const content = (
      <div>
        {title}
        <Button
          className="mcs-primary"
          type="primary"
          onClick={this.handleSaveGridLayout}
        >
          <FormattedMessage
            id="audience.segments.dashboard.reportDashboard.saveGridLayout"
            defaultMessage="Save Grid Layout"
          />
        </Button>
      </div>
    );
    return (
      title && (
        <div>
          <ContentHeader title={content} size={`medium`} />
        </div>
      )
    );
  };

  render() {
    const { segment, layout } = this.props;

    return (
      <div>
        {this.getReportHeaderContent()}
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
