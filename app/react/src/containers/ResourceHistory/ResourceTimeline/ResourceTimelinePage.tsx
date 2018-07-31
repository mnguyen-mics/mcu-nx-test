import * as React from 'react';
import ResourceTimeline from './ResourceTimeline';
import { Layout, Row } from 'antd';
import { ResourceName } from '../../../models/resourceHistory/ResourceHistory';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import { RouteComponentProps, withRouter } from 'react-router';
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
  RouteComponentProps<{ organisationId: string}> &
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
      match: {
        params: { organisationId },
      },
      resourceName,
      resourceId,
      handleClose,
    } = this.props;
    return (
      <div className="ant-layout">
        <ResourceTimelineActionBar resourceName='Campaign' handleClose={handleClose}/>
        <div className="ant-layout">
          <Content className="mcs-content-container p-t-40">
            <Row className="mcs-history">
              <ResourceTimeline
                organisationId={organisationId}
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
  withRouter,
  injectIntl,
)(ResourceTimelinePage)
