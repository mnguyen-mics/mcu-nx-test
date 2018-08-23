import * as React from 'react';
import ResourceTimeline from './ResourceTimeline';
import { Layout, Row } from 'antd';
import { ResourceName } from '../../../models/resourceHistory/ResourceHistory';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import { compose } from 'recompose';
import ResourceTimelineActionBar from './ResourceTimelineActionBar';
import { FormatProperty } from './domain';

const { Content } = Layout

export interface ResourceTimelinePageProps {
  resourceName: ResourceName;
  resourceId: string;
  handleClose: () => void;
  formatProperty: FormatProperty;
}

type Props =
  ResourceTimelinePageProps &
  InjectedIntlProps;

interface State {
  isLoading: boolean;
}
  
class ResourceTimelinePage extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      isLoading: true,
    }
  }
    
  render() {
    const {
      resourceName,
      resourceId,
      handleClose,
      formatProperty,
    } = this.props;
    return (
      <div className="ant-layout edit-layout">
        <ResourceTimelineActionBar handleClose={handleClose} formatProperty={formatProperty}/>
        <div className="ant-layout">
          <Content className="mcs-content-container p-t-40">
            <Row className="mcs-history">
              <ResourceTimeline
                resourceName={resourceName}
                resourceId={resourceId}
                formatProperty={formatProperty}
              />
            </Row>
          </Content>
        </div>
      </div>
      
    );
  }
}

export default compose<Props, ResourceTimelinePageProps>(
  injectIntl,
)(ResourceTimelinePage)
