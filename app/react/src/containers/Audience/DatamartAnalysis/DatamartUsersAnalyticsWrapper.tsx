import * as React from 'react';
import { Layout, Layouts } from 'react-grid-layout';
import ContentHeader from '../../../components/ContentHeader';
import DatamartAnalysisContent from './DatamartUsersAnalyticsContent';

interface DatamartAnalysisProps {
  title?: string;
  datamartId: string;
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

  onLayoutChange(layout: Layout[], allLayouts: Layouts) {
    this.setState({ layout: layout });
  }

  render() {
    const { title, datamartId } = this.props;
    return (
      <div>
        <ContentHeader title={title} size={`large`} />
        <DatamartAnalysisContent datamartId={datamartId}/>
      </div>
    );
  }
}

export default DatamartAnalysisWrapper;
