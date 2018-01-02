import * as React from 'react';
import { Button, Modal, Row, Col } from 'antd';
import { ButtonType } from 'antd/lib/button/button';
import moment from 'moment';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { injectIntl, FormattedMessage, InjectedIntlProps } from 'react-intl';

import McsIcons, { McsIconType } from '../../../../components/McsIcons';
import CreativeService from '../../../../services/CreativeService';
import * as actionsRedux from '../../../../state/Notifications/actions';
import messages from '../Edit/messages';
import {
  AuditResource,
  CreativeAuditAction,
  DisplayAdResource,
} from '../../../../models/creative/CreativeResource';
import { isDisplayAdResource } from '../Edit/domain';
import log from '../../../../utils/Logger';
import { RouteComponentProps, withRouter } from 'react-router';

const confirm = Modal.confirm;

interface AuditComponentProps {
  creativeId: string;
}

interface State {
  availableUserAuditActions: string[];
  auditResource: AuditResource | null;
  modalVisible: boolean;
}

type JoinedProps = AuditComponentProps &
RouteComponentProps<{ organisationId: string }> &
InjectedIntlProps;

class AuditComponent extends React.Component<JoinedProps, State> {
  constructor(props: JoinedProps) {
    super(props);
    this.state = {
      availableUserAuditActions: [],
      auditResource: null,
      modalVisible: false,
    };
  }
  
  componentDidMount() {
    const { creativeId } = this.props;
    if (isDisplayAdResource(creative)) {
      CreativeService.getAuditStatus(creative.id)
        .then(res => {
          this.setState(prevState => {
            const nextState = {
              ...prevState,
            };
            nextState.auditStatus = [res.data];
            return nextState;
          });
        })
        .catch(e => {
          actionsRedux.notifyError(e);
        });
    }
  }

  componentWillReceiveProps(nextProps: JoinedProps) {
    if (
      isDisplayAdResource(nextProps.creative) &&
      isDisplayAdResource(this.props.creative)
    ) {
      if (nextProps.creative.id !== this.props.creative.id) {
        CreativeService.getAuditStatus(nextProps.creative.id)
          .then(res => {
            this.setState(prevState => {
              const nextState = {
                ...prevState,
              };
              nextState.auditStatus = [res.data];
              return nextState;
            });
          })
          .catch(e => {
            actionsRedux.notifyError(e);
          });
      }
    }
  }

  showHideModal = () => {
    this.setState(prevState => {
      const nextState = { ...prevState };
      nextState.modalVisible = !prevState.modalVisible;
      return nextState;
    });
  };

  handleCancel = () => {
    this.showHideModal();
  };


  actionAudit = (action: CreativeAuditAction) => {
    const {
      intl: {
        formatMessage,
      },
      creative,
      onAuditChange,
      match: {
        params: {
          organisationId,
        }
      }
    } = this.props;

    let type: ButtonType = 'primary';
    let modalMessages = {
      title: formatMessage(messages.creativeAuditStatusConfirmTitle),
      content: formatMessage(messages.creativeAuditStatusConfirmDescription),
    };
    let message = messages.creativeAuditStatusStart;
    if (action === 'RESET_AUDIT') {
      message = messages.creativeAuditStatusReset;
      // type = 'default'; no default value in ButtonType => ommited meaning default
      modalMessages = {
        title: formatMessage(messages.creativeAuditStatusConfirmResetTitle),
        content: formatMessage(
          messages.creativeAuditStatusConfirmResetDescription,
        ),
      };
    } else if (action === 'START_AUDIT') {
      message = messages.creativeAuditStatusStart;
      type = 'primary';
    }

    return {
      type: type,
      action: () => {
        confirm({
          title: modalMessages.title,
          content: modalMessages.content,
          onOk() {
            if (isDisplayAdResource(creative) && onAuditChange) {
              CreativeService.makeAuditAction(creative.id, action).then(() => {
                onAuditChange(organisationId, creative.id);
              }).catch(e => {
                log.error(e);
              });
            }
          }
        });
      },
      message: message,
    };
  };

  renderAuditStatus = () => {
    if (isDisplayAdResource(this.props.creative)) {
      const { creative: { audit_status: auditStatus } } = this.props;

      let message = messages.creativeAuditStatusFailed;
      let icon: McsIconType = 'close-big';
      let color = '#CECECE';
      if (auditStatus === 'AUDIT_FAILED') {
        message = messages.creativeAuditStatusFailed;
        icon = 'close-big';
        color = '#fc3f48'; // theme error color
      } else if (auditStatus === 'AUDIT_PASSED') {
        message = messages.creativeAuditStatusPassed;
        icon = 'check';
        color = '#00ab67'; // theme success error
      } else if (auditStatus === 'AUDIT_PENDING') {
        message = messages.creativeAuditStatusPending;
        icon = 'refresh';
        color = '#fd7c12'; // theme warning error
      } else if (auditStatus === 'AUDIT_PARTIALLY_PASSED') {
        message = messages.creativeAuditStatusPartiallyPassed;
        icon = 'close-big';
        color = '#fd7c12'; // theme warning error
      } else if (auditStatus === 'NOT_AUDITED') {
        message = messages.creativeAuditStatusNotAudited;
        icon = 'close-big';
        color = '#fc3f48'; // theme error color
      } else {
        message = messages.creativeAuditStatusNotAudited;
        icon = 'close-big';
        color = '#fc3f48'; // theme error color
      }

      return {
        message: message,
        icon: icon,
        color: color,
      };
    } else {
      const icon: McsIconType = 'close-big';
      return {
        message: messages.creativeAuditStatusNotAudited,
        icon: icon,
        color: '#fc3f48',
      };
    }
  };

  renderAuditAction = () => {
    if (isDisplayAdResource(this.props.creative)) {
      const {
        creative: { available_user_audit_actions: actions },
        mode,
      } = this.props;

      return actions
        ? actions.map(item => {
            return (
              <div
                key={item}
                className={
                  mode && mode === 'creativeCard' ? '' : 'float-right m-l-10'
                }
              >
                <Button
                  type={this.actionAudit(item).type}
                  onClick={this.actionAudit(item).action}
                >
                  <FormattedMessage {...this.actionAudit(item).message} />
                </Button>
              </div>
            );
          })
        : null;
    } else {
      return log.error('Creative not saved');
    }
  };

  renderStatusButton = () => {
    const { auditStatus, mode } = this.state;

    return auditStatus.length ? (
      <div
        className={mode && mode === 'creativeCard' ? '' : 'float-right m-l-10'}
      >
        <Button onClick={this.showHideModal}>
          <FormattedMessage {...messages.creativeAuditStatusDetails} />
        </Button>
      </div>
    ) : null;
  };

  render() {
    const { creative, mode } = this.props;

    const { auditStatus } = this.state;

    const iconAndTextStatus = (
      <div className="float-left" style={{ lineHeight: '34px' }}>
        <McsIcons
          type={this.renderAuditStatus().icon}
          additionalClass="m-r-10"
          style={{
            verticalAlign: 'middle',
            color: this.renderAuditStatus().color,
          }}
        />
        <FormattedMessage {...this.renderAuditStatus().message} />
      </div>
    );

    return (
      creative ? (
        <div>
          {mode && mode === 'creativeCard' ? (
            <Button
              className="creativecard-audit-button"
              onClick={this.showHideModal}
            >
              {iconAndTextStatus}
            </Button>
          ) : (
            <div>
              {this.renderAuditAction()}
              {this.renderStatusButton()}
              {iconAndTextStatus}
            </div>
          )}
          <Modal
            title={
              <FormattedMessage {...messages.creativeAuditStatusDetails} />
            }
            visible={this.state.modalVisible}
            onCancel={this.handleCancel}
            footer={null}
          >
            {auditStatus &&
              auditStatus.map((item: AuditResource) => {
                return (
                  <Row key={item.date}>
                    <Col span={item.feedback ? 8 : 12}>
                      {item.display_network}:{' '}
                      <FormattedMessage {...this.renderAuditStatus().message} />
                    </Col>
                    {item.feedback ? <Col span={8}>{item.feedback}</Col> : null}
                    <Col span={item.feedback ? 8 : 12}>
                      {moment(item.date).format('DD/MM/YYYY HH:mm:ss')}
                    </Col>
                  </Row>
                );
              })}
          </Modal>
        </div>
      ) :  
      (
        <div>
          {iconAndTextStatus}
        </div>
      )
    );
  }
}

export default compose<JoinedProps, AuditComponentProps>(
  injectIntl,
  withRouter,
  connect(undefined, { notifyError: actionsRedux.notifyError }),
)(AuditComponent);
