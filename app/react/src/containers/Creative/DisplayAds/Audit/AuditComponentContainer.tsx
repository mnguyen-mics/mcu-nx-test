import * as React from 'react';
import { Spin } from 'antd';
import CreativeService from '../../../../services/CreativeService';
import {
  DisplayAdResource,
  AuditStatusResource,
  CreativeAuditAction,
} from '../../../../models/creative/CreativeResource';
import AuditComponent from './AuditComponent';
import { compose } from 'recompose';
import injectNotifications, { InjectedNotificationProps } from '../../../Notifications/injectNotifications';

export interface AuditComponentContainerProps {
  creativeId: string;
}

interface State {
  loading: boolean;
  creative?: DisplayAdResource;
  auditStatuses: AuditStatusResource[];
}

type Props = AuditComponentContainerProps & InjectedNotificationProps;

class AuditComponentContainer extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      loading: false,
      auditStatuses: [],
    };
  }

  fetchData = () => {
    const { creativeId } = this.props;
    this.setState({ loading: true });
    Promise.all([
      CreativeService.getDisplayAd(creativeId),
      CreativeService.getAuditStatus(creativeId),
    ]).then(([creativeRes, auditRes]) => {
      this.setState({
        loading: false,
        creative: creativeRes.data,
        auditStatuses: auditRes.data,
      });
    });
  };

  makeAuditAction = (action: CreativeAuditAction) => {
    const { creativeId, notifyError } = this.props;
    CreativeService.makeAuditAction(creativeId, action)
      .then(this.fetchData)
      .catch(err => notifyError(err));
  };

  componentDidMount() {
    this.fetchData();
  }

  render() {
    const { loading, creative, auditStatuses } = this.state;

    if (!creative) return null;

    return (
      <Spin spinning={loading}>
        <AuditComponent
          creative={creative}
          auditStatuses={auditStatuses}
          onMakeAuditAction={this.makeAuditAction}
        />
      </Spin>
    );
  }
}

export default compose<Props, AuditComponentContainerProps>(
  injectNotifications,
)(AuditComponentContainer);
