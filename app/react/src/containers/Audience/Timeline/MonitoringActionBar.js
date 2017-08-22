import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Input, Select, Button, Modal } from 'antd';
import { withRouter } from 'react-router-dom';
import { injectIntl, intlShape, FormattedMessage } from 'react-intl';
import { compose } from 'recompose';

import { Actionbar } from '../../Actionbar';
import McsIcons from '../../../components/McsIcons';
import messages from './messages';

const InputGroup = Input.Group;
const Option = Select.Option;

class MonitoringActionbar extends Component {

  state = {
    modalVisible: false,
    form: {
      type: 'user_point_id',
      value: null,
    },
  }

  setModalVisible = (modalVisible) => {
    this.setState({ modalVisible });
  }

  submitModal = () => {
    const {
      history,
       match: {
        params: {
          organisationId,
        },
      },
    } = this.props;
    history.push(`/v2/o/${organisationId}/audience/timeline/${this.state.form.type}/${this.state.form.value}`);
    this.setState(prevState => {
      const nextState = {
        ...prevState,
        modalVisible: false,
        form: {
          type: 'user_point_id',
          value: null,
        },
      };
      return nextState;
    });
  }

  updateValue = (type, e) => {
    this.setState(prevState => {
      const nextState = {
        ...prevState,
      };
      nextState.form[type] = e.target.value;
      return nextState;
    });
  }

  updateType = (type) => {
    this.setState(prevState => {
      const nextState = {
        ...prevState,
      };
      nextState.form.type = type;
      return nextState;
    });
  }

  render() {

    const {
      match: {
        params: {
          organisationId,
        },
      },
      intl: {
        formatMessage,
      },
    } = this.props;

    const breadcrumbPaths = [{ name: formatMessage(messages.monitoring), url: `/v2/o/${organisationId}/audience/timeline` }];


    return (
      <Actionbar path={breadcrumbPaths}>
        <Modal
          title="Enter the user identifier you want to lookup"
          wrapClassName="vertical-center-modal"
          visible={this.state.modalVisible}
          footer={[
            <Button key="back" size="large" onClick={() => this.setModalVisible(false)}>Return</Button>,
            <Button disabled={this.state.form.value === null || this.state.form.type === null} key="submit" type="primary" size="large" onClick={(e) => this.submitModal(e)}>
              Submit
            </Button>,
          ]}
          onCancel={() => this.setModalVisible(false)}
        >

          <InputGroup compact>
            <Select name="type" style={{ width: '30%' }} defaultValue={this.state.form.type} onChange={this.updateType}>
              <Option value="user_point_id">User Point Id</Option>
              <Option value="user_agent_id">Vector Id</Option>
              <Option value="email_hash">Email Hash</Option>
            </Select>
            <Input name="value" placeholder="input your value" style={{ width: '70%' }} onChange={(e) => { e.persist(); this.updateValue('value', e); }} />
          </InputGroup>

        </Modal>
        <Button className="mcs-primary" type="primary" onClick={() => { this.setModalVisible(true); }}>
          <McsIcons type="refresh" /> <FormattedMessage {...messages.lookUpUser} />
        </Button>
      </Actionbar>
    );

  }

}

MonitoringActionbar.propTypes = {
  match: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  history: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  intl: intlShape.isRequired,
};

MonitoringActionbar = compose(
  injectIntl,
  withRouter,
)(MonitoringActionbar);

export default MonitoringActionbar;
