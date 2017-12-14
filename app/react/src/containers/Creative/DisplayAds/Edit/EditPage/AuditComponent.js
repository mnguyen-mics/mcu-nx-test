import React, { Component } from 'react';
import { Button, Modal, Row, Col, Popover } from 'antd';
import PropTypes from 'prop-types';
import moment from 'moment';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { intlShape, injectIntl, FormattedMessage } from 'react-intl';
import McsIcons from '../../../../../components/McsIcons.tsx';
import CreativeService from '../../../../../services/CreativeService.ts';
import * as actionsRedux from '../../../../../state/Notifications/actions';
import messages from '../messages';

const confirm = Modal.confirm;

class AuditComponent extends Component {

  state = {
    status: [],
    visible: false
  }

  componentDidMount() {
    const {
      creative,
      notifyError
    } = this.props;
    if (creative && creative.id) {
      CreativeService.getAuditStatus(creative.id).then(res => {
        this.setState(prevState => {
          const nextState = {
            ...prevState
          };
          nextState.status = res.data;
          return nextState;
        });
      }).catch(e => {
        notifyError(e);
      });
    }
  }

  componentWillReceiveProps(nextProps) {
    const {
      notifyError
    } = this.props;
    if (nextProps.creative && nextProps.creative.id !== this.props.creative.id) {
      CreativeService.getAuditStatus(nextProps.creative.id).then(res => {
        this.setState(prevState => {
          const nextState = {
            ...prevState
          };
          nextState.status = res.data;
          return nextState;
        });
      })
      .catch(e => {
        notifyError(e);
      });
    }
  }

  showHideModal = () => {
    this.setState(prevState => {
      const nextState = { ...prevState };
      nextState.visible = !nextState.visible;
      return nextState;
    });
  }

  handleCancel = () => {
    this.showHideModal();
  }

  actionAudit = (action) => {
    const {
      creative,
      intl: {
        formatMessage
      },
      notifyError,
      onAuditChange
    } = this.props;

    let type = 'primary';
    let modalMessages = {
      title: formatMessage(messages.creativeAuditStatusConfirmTitle),
      content: formatMessage(messages.creativeAuditStatusConfirmDescription)
    };
    let message = messages.creativeAuditStatusStart;
    if (action === 'RESET_AUDIT') {
      message = messages.creativeAuditStatusReset;
      type = 'default';
      modalMessages = {
        title: formatMessage(messages.creativeAuditStatusConfirmResetTitle),
        content: formatMessage(messages.creativeAuditStatusConfirmResetDescription)
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
            CreativeService.makeAuditAction(creative.id, action).then(() => {
              onAuditChange();
            }).catch(e => {
              // TODO NOTIFY
              notifyError(e);
            });
          },
          onCancel() {
            // Cancel
          },
        });
      },
      message: message
    };
  }

  renderAuditStatus = () => {
    const {
      creative: {
        audit_status: auditStatus,
      }
    } = this.props;

    let message = messages.creativeAuditStatusFailed;
    let icon = 'close-big';
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
    }

    return {
      message: message,
      icon: icon,
      color: color,
    };
  }

  renderAuditAction = () => {
    const {
      creative: {
        available_user_audit_actions: actions,
      },
      mode,
    } = this.props;

    return actions ? actions.map(item => {
      return (
        <div key={item} className={mode && mode === 'creativeCard' ? '' : 'float-right m-l-10'}>
          <Button type={this.actionAudit(item).type} onClick={this.actionAudit(item).action}>
            <FormattedMessage {...this.actionAudit(item).message} />
          </Button>
        </div>
      );
    }) : null;
  }

  renderStatusButton = () => {
    const {
      status,
      mode,
    } = this.state;

    return status.length ?
      <div className={mode && mode === 'creativeCard' ? '' : 'float-right m-l-10'}>
        <Button onClick={() => { this.showHideModal(); }}>
          <FormattedMessage {...messages.creativeAuditStatusDetails} />
        </Button>
      </div>
      : null;
  }

  render() {
    const {
      creative,
      mode,
    } = this.props;

    const {
      status
    } = this.state;

    const PopoverButtons = (
      <div>
        <Row type="flex">
          <Col span={12}>
            { this.renderAuditAction() }
          </Col>
          <Col span={12}>
            { this.renderStatusButton() }
          </Col>
        </Row>
      </div>
    );

    const iconAndTextStatus = (
      <div className="float-left" style={{ lineHeight: '34px' }}>
        <McsIcons type={this.renderAuditStatus().icon} className="m-r-10" style={{ verticalAlign: 'middle', color: this.renderAuditStatus().color }} />
        <FormattedMessage {...this.renderAuditStatus().message} />
      </div>
    );

    return creative && (
      <div>
        { mode && mode === 'creativeCard' ?
          <Popover content={PopoverButtons} title="Audit">
            { iconAndTextStatus }
          </Popover> :
          <div>
            { this.renderAuditAction() }
            { this.renderStatusButton() }
            { iconAndTextStatus }
          </div>
        }
        <Modal
          title={<FormattedMessage {...messages.creativeAuditStatusDetails} />}
          visible={this.state.visible}
          onCancel={this.handleCancel}
          footer={null}
        >
          {status && status.map(item => {
            return (<Row key={item.date}>
              <Col span={item.feedback ? 8 : 12}>{item.display_network}: <FormattedMessage {...this.renderAuditStatus(item.status).message} /></Col>
              {item.feedback ? <Col span={8}>{item.feedback}</Col> : null}
              <Col span={item.feedback ? 8 : 12}>{moment(item.date).format('DD/MM/YYYY HH:mm:ss')}</Col>
            </Row>);
          })}
        </Modal>
      </div>
    );
  }
}

AuditComponent.defaultProps = {
  creative: null,
  onAuditChange: () => {}
};

AuditComponent.propTypes = {
  intl: intlShape.isRequired,
  creative: PropTypes.shape(),
  onAuditChange: PropTypes.func,
  notifyError: PropTypes.func.isRequired,
  mode: PropTypes.string.isRequired,
};

AuditComponent = compose(
  injectIntl,
  connect(
    undefined,
    { notifyError: actionsRedux.notifyError },
  ),
)(AuditComponent);

export default AuditComponent;
