import * as React from 'react';
import { Spin } from 'antd';
import { connect } from 'react-redux';
import CreativeService from '../../../../services/CreativeService';
import * as NotificationActions from '../../../../state/Notifications/actions';
import {
  DisplayAdResource,
  AuditStatusResource,
  CreativeAuditAction,
} from '../../../../models/creative/CreativeResource';
import AuditComponent from './AuditComponent';

export interface AuditComponentContainerProps {
  creativeId: string;
}

interface State {
  loading: boolean;
  creative?: DisplayAdResource;
  auditStatuses: AuditStatusResource[];
}

interface MapDispacthToProps {
  notifyError: (err: any) => void;
}

type Props = AuditComponentContainerProps & MapDispacthToProps;

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

export default connect(undefined, {
  notifyError: NotificationActions.notifyError,
})(AuditComponentContainer);
