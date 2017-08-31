import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Row, Tooltip, Modal, Col, Button } from 'antd';
import { injectIntl, intlShape, FormattedMessage } from 'react-intl';
import moment from 'moment';
import { Card } from '../../../../components/Card';
import McsIcons from '../../../../components/McsIcons';
import { TableView } from '../../../../components/TableView';
import messages from '../messages';

class EmailCard extends Component {

  constructor(props) {
    super(props);
    this.state = {
      showMore: false,
      showModal: false,
      selectedAgent: {},
    };
  }

  renderModal = () => {
    const {
      selectedAgent,
      showModal,
    } = this.state;

    const {
      intl: {
        formatMessage,
      },
    } = this.props;

    const renderTableCell = (key, text) => {
      if (key.indexOf('_ts') > -1) {
        if (text !== null) {
          return <span>{moment(text).format('YYYY-MM-DD HH:mm:ss')}</span>;
        }
        return <span><i><FormattedMessage {...messages.nullEmail} /></i></span>;
      }
      if (typeof text === 'boolean') {
        return <span>{text ? <McsIcons type="check" /> : <McsIcons type="close" /> }</span>;
      }
      return <span>{text ? text : (<i><FormattedMessage {...messages.nullEmail} /></i>)}</span>;
    };

    const dataSource = selectedAgent.providers ? selectedAgent.providers : null;
    const columnsDefinitions = (selectedAgent.providers && selectedAgent.providers.length > 0) ? {
      dataColumnsDefinition: Object.keys(selectedAgent.providers[0]).map(key => {
        return {
          intlMessage: messages[key.toUpperCase()],
          key: key,
          isHiddable: false,
          render: (text) => renderTableCell(key, text),
        };
      }),
      actionsColumnsDefinition: null,
    } : null;
    return (showModal) && (<Modal
      title={formatMessage(messages.titleModalEmail)}
      visible={showModal}
      width="70%"
      onOk={this.handleClose}
      onCancel={this.handleClose}
      footer={[
        <Button key="submit" type="primary" size="large" onClick={this.handleClose}>
          <FormattedMessage {...messages.okModalEmail} />
        </Button>,
      ]}
    >
      <Row gutter={10} className="table-line">
        <Col span={24} className="title"><FormattedMessage {...messages.emailInfo} /></Col>
        <Col className="table-left" span={12}>
          <FormattedMessage {...messages.emailAddress} />
        </Col>
        <Col className="table-right" span={12}>
          {selectedAgent.email}
        </Col>
        <Col className="table-left" span={12}>
          <FormattedMessage {...messages.emailHash} />
        </Col>
        <Col className="table-right" span={12}>
          {selectedAgent.hash}
        </Col>
        <Col className="table-left" span={12}>
          <FormattedMessage {...messages.emailCreation} />
        </Col>
        <Col className="table-right" span={12}>
          {moment(selectedAgent.creation_ts).format('YYYY-MM-DD HH:mm:ss')}
        </Col>
        <Col className="table-left" span={12}>
          <FormattedMessage {...messages.emailActivity} />
        </Col>
        <Col className="table-right" span={12}>
          {moment(selectedAgent.last_activity_ts).format('YYYY-MM-DD HH:mm:ss')}
        </Col>
      </Row>
      <Row>
        {selectedAgent.providers ? <div><Col span={24} className="title"><FormattedMessage {...messages.emailConsent} /></Col><Col span={24}><TableView dataSource={dataSource} columnsDefinitions={columnsDefinitions} loading={false} /></Col></div> : null}
      </Row>
    </Modal>);
  }

  initModal = (selectedAgent) => {
    this.setState(prevState => {
      const nextState = {
        ...prevState,
        selectedAgent: {
          ...selectedAgent,
        },
      };
      nextState.showModal = true;
      return nextState;
    });
  }

  handleClose = () => {
    this.setState(prevState => {
      const nextState = {
        ...prevState,
      };
      nextState.showModal = false;
      return nextState;
    });
  }

  render() {
    const {
      identifiers,
      intl: {
        formatMessage,
      },
    } = this.props;

    const userAgents = identifiers.items.USER_EMAIL || [];
    const accountsFormatted = (userAgents.length > 5 && !this.state.showMore) ? userAgents.splice(0, 5) : userAgents;
    const canViewMore = userAgents.length > 5 ? true : false;

    return (
      <Card title={formatMessage(messages.emailTitle)} isLoading={identifiers.isLoading}>
        { this.renderModal() }
        { accountsFormatted && accountsFormatted.map(agent => {
          return (
            <div key={agent.email + agent.hash}>
              <Row gutter={10} className="table-line">
                <div className="icon-left">
                  <McsIcons type="email" />
                </div>
                <div className="info-right">
                  <div><Tooltip placement="topRight" title={agent.email}>{agent.email}</Tooltip></div>
                  <div><Tooltip placement="topRight" title={agent.hash}>{agent.hash}</Tooltip></div>
                </div>
              </Row>
              <Row className="text-right"><button className="button-sm" onClick={() => { this.initModal(agent); }}><FormattedMessage {...messages.viewMore} /></button></Row>
            </div>
          );
        })}
        { (accountsFormatted.length === 0 || identifiers.hasItems === false) && (<span><FormattedMessage {...messages.emptyEmail} /></span>) }
        { (canViewMore) ? (
           (!this.state.showMore) ? (
             <div className="mcs-card-footer">
               <button className="mcs-card-footer-link" onClick={(e) => { e.preventDefault(); this.setState({ showMore: true }); }}><FormattedMessage {...messages.viewMore} /></button>
             </div>
           ) : (
             <div className="mcs-card-footer">
               <button className="mcs-card-footer-link" onClick={(e) => { e.preventDefault(); this.setState({ showMore: false }); }}><FormattedMessage {...messages.viewLess} /></button>
             </div>
          )
          ) : null }
      </Card>
    );
  }
}

EmailCard.propTypes = {
  intl: intlShape.isRequired,
  identifiers: PropTypes.shape({
    isLoading: PropTypes.bool.isRequired,
    hasItems: PropTypes.bool.isRequired,
    items: PropTypes.object.isRequired,
  }).isRequired,
};

EmailCard = injectIntl(EmailCard);

export default EmailCard;
