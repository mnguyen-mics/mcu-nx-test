import * as React from 'react';
import { Input, Select, Button, Modal } from 'antd';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { injectIntl, FormattedMessage, InjectedIntlProps } from 'react-intl';
import { compose } from 'recompose';
import Actionbar from '../../../components/ActionBar';
import McsIcon from '../../../components/McsIcon';
import messages from './messages';
import { Identifier } from './Monitoring';
import {
  UserAccountCompartmentDatamartSelectionResource,
  DatamartResource,
} from '../../../models/datamart/DatamartResource';
import DatamartService from '../../../services/DatamartService';
import { Loading } from '../../../components';

const InputGroup = Input.Group;
const Option = Select.Option;

interface MonitoringActionBarProps {
  selectedDatamart: DatamartResource;
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
  selectedCompartment?: string;
  compartments?: UserAccountCompartmentDatamartSelectionResource[];
  isLoading?: boolean;
}

class MonitoringActionbar extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      identifierId: '',
      identifierType: 'user_point_id',
    };
  }

  componentDidMount() {
    const {
      selectedDatamart
    } = this.props;

    this.fetchCompartments(selectedDatamart.id);
  }

  componentWillReceiveProps(nextProps: Props) {
    const {
      selectedDatamart
    } = this.props;

    const {
      selectedDatamart: nextSelectedDatamart
    } = nextProps;

    if (selectedDatamart !== nextSelectedDatamart) {
      this.fetchCompartments(nextSelectedDatamart.id);
    }
  }

  fetchCompartments = (datamartId: string) => {
    this.setState({
      isLoading: true
    });

    DatamartService.getUserAccountCompartments(datamartId)
      .then(res => {
        this.setState({
          compartments: res.data,
          isLoading: false
        });
      });

  }

  updateCompartment = (compartmentId: string) => {
    this.setState({
      selectedCompartment: compartmentId,
    });
  };

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
    const { identifierId, identifierType, selectedCompartment } = this.state;
    this.props.onIdentifierChange({
      id: identifierId,
      type: identifierType,
      compartmentId: selectedCompartment,
    });
    this.props.handleModal(false);
  };

  createCompartmentOptions = (compartments: UserAccountCompartmentDatamartSelectionResource[]) => {
    const compartmentOptions = compartments.map(compartment => (
      <Select.Option key={compartment.compartment_id}>
        {compartment.compartment_id}
      </Select.Option>
    ));
    return compartmentOptions;
  };

  render() {
    const {
      match: {
        params: { organisationId },
      },
      intl: { formatMessage },
      isModalVisible,
      handleModal,
      selectedDatamart,
    } = this.props;

    const {
      identifierId,
      identifierType,
      compartments,
      isLoading
    } = this.state;

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

    if (isLoading || !compartments) {
      return <Loading className="loading-full-screen" />;
    }
    else {
      const showCompartment =
        this.state.identifierType === 'user_account_id' &&
        selectedDatamart.datafarm !== 'DF_EU_LEGACY' &&
        compartments.length > 0;

      const compartmentDefaultValue = showCompartment && compartments.filter(c => c.default)[0] ?
        compartments.filter(c => c.default)[0].compartment_id :
        undefined;

      const inputValueWidth = showCompartment ? '50%' : '70%';
      const compartmentOptions = this.createCompartmentOptions(compartments);

      const addOnAfterContent = showCompartment ? (
        <span title="compartment id">comp. id</span>
      ) : (
          undefined
        );

      return (
        <Actionbar paths={breadcrumbPaths}>
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
                style={{ width: inputValueWidth }}
                onChange={onValueChange}
                addonAfter={addOnAfterContent}
              />
              {showCompartment && (
                <Select
                  style={{ width: '20%' }}
                  defaultValue={compartmentDefaultValue}
                  onChange={this.updateCompartment}
                >
                  {compartmentOptions}
                </Select>
              )}
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
}

export default compose<Props, MonitoringActionBarProps>(
  injectIntl,
  withRouter,
)(MonitoringActionbar);
