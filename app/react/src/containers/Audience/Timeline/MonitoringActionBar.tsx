import * as React from 'react';
import { Input, Select, Button, Modal } from 'antd';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { injectIntl, FormattedMessage, InjectedIntlProps } from 'react-intl';
import { compose } from 'recompose';
import { Actionbar } from '../../Actionbar';
import McsIcon from '../../../components/McsIcon';
import messages from './messages';
import { Identifier } from './Monitoring';

const InputGroup = Input.Group;
const Option = Select.Option;

interface MonitoringActionBarProps {
  isModalVisible: boolean;
  handleModal: (visible: boolean) => void;
  onIdentifierChange: (identifier: Identifier) => void;
}

type Props = MonitoringActionBarProps &
  InjectedIntlProps &
  RouteComponentProps<{ organisationId: string }>;

interface State {
  identifierId: string;
  identifierType: string;
}

class MonitoringActionbar extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      identifierId: '',
      identifierType: '',
    };
  }

  updateValue = (e: any) => {
    this.setState({
      identifierId: e.target.value,
    });
  };

  updateType = (type: string) => {
    this.setState({
      identifierType: type,
    });
  };

  submitModal = () => {
    const { identifierId, identifierType } = this.state;
    this.props.onIdentifierChange({
      id: identifierId,
      type: identifierType,
    });
    this.props.handleModal(false);
  };

  render() {
    const {
      match: {
        params: { organisationId },
      },
      intl: { formatMessage },
      isModalVisible,
      handleModal,
    } = this.props;

    const { identifierId, identifierType } = this.state;

    const breadcrumbPaths = [
      {
        name: formatMessage(messages.monitoring),
        url: `/v2/o/${organisationId}/audience/timeline`,
      },
    ];

    const onReturnClick = () => handleModal(false);
    const onUserLookupClick = () => handleModal(true);
    const onSubmitClick = (e: any) => this.submitModal();
    const onValueChange = (e: any) => {
      e.persist();
      this.updateValue(e);
    };

    return (
      <Actionbar path={breadcrumbPaths}>
        <Modal
          title="Enter the user identifier you want to lookup"
          wrapClassName="vertical-center-modal"
          visible={isModalVisible}
          footer={[
            <Button key="back" size="large" onClick={onReturnClick}>
              Return
            </Button>,
            <Button
              disabled={identifierId === null || identifierType === null}
              key="submit"
              type="primary"
              size="large"
              onClick={onSubmitClick}
            >
              Submit
            </Button>,
          ]}
          onCancel={onReturnClick}
        >
          <InputGroup compact={true}>
            <Select
              style={{ width: '30%' }}
              defaultValue={identifierType || 'user_point_id'}
              onChange={this.updateType}
            >
              <Option value="user_point_id">User Point Id</Option>
              <Option value="user_account_id">User Account Id</Option>
              <Option value="user_agent_id">Vector Id</Option>
              <Option value="email_hash">Email Hash</Option>
            </Select>
            <Input
              name="value"
              placeholder="input your value"
              style={{ width: '70%' }}
              onChange={onValueChange}
            />
          </InputGroup>
        </Modal>
        <Button
          className="mcs-primary"
          type="primary"
          onClick={onUserLookupClick}
        >
          <McsIcon type="refresh" />{' '}
          <FormattedMessage {...messages.lookUpUser} />
        </Button>
      </Actionbar>
    );
  }
}

export default compose<Props, MonitoringActionBarProps>(
  injectIntl,
  withRouter,
)(MonitoringActionbar);
