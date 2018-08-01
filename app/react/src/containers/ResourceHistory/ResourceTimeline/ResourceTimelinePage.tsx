import * as React from 'react';
import ResourceTimeline from './ResourceTimeline';
import { Layout, Row } from 'antd';
import { ResourceName } from '../../../models/resourceHistory/ResourceHistory';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import { compose } from 'recompose';
import ResourceTimelineActionBar from './ResourceTimelineActionBar';

const { Content } = Layout

export interface ResourceTimelinePageProps {
  resourceName: ResourceName;
  resourceId: string;
  handleClose: () => void;
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
    } = this.props;
    return (
      <div className="ant-layout">
        <ResourceTimelineActionBar resourceName={resourceName} handleClose={handleClose}/>
        <div className="ant-layout">
          <Content className="mcs-content-container p-t-40">
            <Row className="mcs-history">
              <ResourceTimeline
                resourceName={resourceName}
                resourceId={resourceId}
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
