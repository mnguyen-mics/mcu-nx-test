import * as React from 'react';
import { Button, Modal, Row, Col } from 'antd';
import moment from 'moment';
import { FormattedMessage, defineMessages, injectIntl, InjectedIntlProps } from 'react-intl';
import {
  AuditStatusResource,
  CreativeAuditAction,
  DisplayAdResource,
  AuditStatus,
} from '../../../../models/creative/CreativeResource';
import AuditStatusRenderer from './AuditStatusRenderer';
import AuditActionButtonList from './AuditActionButtonList';

interface AuditComponentProps {
  creative: DisplayAdResource;
  auditStatuses: AuditStatusResource[];
  onMakeAuditAction: (auditAction: CreativeAuditAction) => void;
}

interface State {
  modalVisible: boolean;
}

type Props = AuditComponentProps & InjectedIntlProps;

class AuditComponent extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      modalVisible: false,
    };
  }

  toggleDisplayModal = () => {
    this.setState(prevState => ({
      modalVisible: !prevState.modalVisible,
    }));
  };

  render() {
    const { auditStatuses, creative, onMakeAuditAction, intl } = this.props;

    const auditDetailsMessage = (
      <FormattedMessage
        id='creatives.audit.status.details.button-label'
        defaultMessage='Audit Details'
      />
    );

    const auditDetailsButton = auditStatuses.length > 0 && (
      <div className='float-right m-l-10'>
        <Button onClick={this.toggleDisplayModal}>{auditDetailsMessage}</Button>
      </div>
    );

    return (
      <div style={{ overflow: 'hidden' }} className='mcs-modal_container'>
        <div>
          <div className={'float-left'} style={{ lineHeight: '59px' }}>
            <AuditStatusRenderer auditStatus={creative.audit_status} />
          </div>
          <div className='left-part-margin'>
            <AuditActionButtonList
              auditActions={creative.available_user_audit_actions}
              confirmAuditAction={onMakeAuditAction}
            />
            {auditDetailsButton}
          </div>
        </div>
        <Modal
          title={auditDetailsMessage}
          visible={this.state.modalVisible}
          footer={null}
          onCancel={this.toggleDisplayModal}
        >
          {auditStatuses.map(auditStatus => {
            return (
              <Row key={auditStatus.date}>
                <Col span={auditStatus.feedback ? 8 : 12}>
                  {auditStatus.display_network}:{' '}
                  <span>{intl.formatMessage(auditStatusMessageMap[auditStatus.status])}</span>
                </Col>
                {auditStatus.feedback ? <Col span={8}>{auditStatus.feedback}</Col> : null}
                <Col span={auditStatus.feedback ? 8 : 12}>
                  {moment(auditStatus.date).format('DD/MM/YYYY HH:mm:ss')}
                </Col>
              </Row>
            );
          })}
        </Modal>
      </div>
    );
  }
}

export default injectIntl(AuditComponent);

export const auditStatusMessageMap: {
  [key in AuditStatus]: FormattedMessage.MessageDescriptor;
} = defineMessages({
  AUDIT_PENDING: {
    id: 'creatives.display.audit.status.pending',
    defaultMessage: 'Audit Pending',
  },
  AUDIT_FAILURE: {
    id: 'creatives.display.audit.status.failed',
    defaultMessage: 'Audit Failed',
  },
  AUDIT_SUCCESS: {
    id: 'creatives.display.audit.status.passed',
    defaultMessage: 'Audit Success',
  },
});
