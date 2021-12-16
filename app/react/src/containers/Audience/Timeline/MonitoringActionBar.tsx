import * as React from 'react';
import { Input, Select, Button, Modal } from 'antd';
import { withRouter, RouteComponentProps, Link } from 'react-router-dom';
import { injectIntl, FormattedMessage, InjectedIntlProps } from 'react-intl';
import { compose } from 'recompose';
import { Actionbar, McsIcon } from '@mediarithmics-private/mcs-components-library';
import messages from './messages';
import { Identifier } from './Monitoring';
import {
  UserAccountCompartmentDatamartSelectionResource,
  DatamartResource,
} from '../../../models/datamart/DatamartResource';
import { Loading } from '../../../components';
import { IDatamartService } from '../../../services/DatamartService';
import { TYPES } from '../../../constants/types';
import { lazyInject } from '../../../config/inversify.config';

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
  @lazyInject(TYPES.IDatamartService)
  private _datamartService: IDatamartService;

  constructor(props: Props) {
    super(props);
    this.state = {
      identifierId: '',
      identifierType: 'user_point_id',
    };
  }

  componentDidMount() {
    const { selectedDatamart } = this.props;

    this.fetchCompartments(selectedDatamart.id);
  }

  componentDidUpdate(previousProps: Props) {
    const { selectedDatamart } = this.props;

    const { selectedDatamart: previousSelectedDatamart } = previousProps;

    if (selectedDatamart !== previousSelectedDatamart) {
      this.fetchCompartments(selectedDatamart.id);
    }
  }

  fetchCompartments = (datamartId: string) => {
    this.setState({
      isLoading: true,
    });

    this._datamartService
      .getUserAccountCompartmentDatamartSelectionResources(datamartId)
      .then(res => {
        this.setState({
          compartments: res.data,
          isLoading: false,
        });

        // console.log(res.data)
        // console.log(this.props)

        const defaultCompartment =
          res.data.length > 0 ? res.data.filter(c => c.default)[0] : undefined;
        if (defaultCompartment) {
          this.setState({
            selectedCompartment: defaultCompartment.compartment_id,
          });
        }
      });
  };

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
      <Select.Option key={compartment.compartment_id} value={compartment.compartment_id}>
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

    const { identifierId, identifierType, compartments, isLoading, selectedCompartment } =
      this.state;

    const breadcrumbPaths = [
      <Link key='1' to={`/v2/o/${organisationId}/audience/timeline`}>
        {formatMessage(messages.monitoring)}
      </Link>,
    ];

    const onReturnClick = () => handleModal(false);
    const onUserLookupClick = () => handleModal(true);
    const onSubmitClick = (e: any) => this.submitModal();
    const onValueChange = (e: any) => {
      e.persist();
      this.updateValue(e);
    };

    if (isLoading || !compartments) {
      return <Loading isFullScreen={true} />;
    } else {
      const showCompartment =
        this.state.identifierType === 'user_account_id' &&
        selectedDatamart.datafarm !== 'DF_EU_LEGACY' &&
        compartments.length > 0;

      const compartmentDefaultValue = showCompartment ? selectedCompartment : undefined;

      const inputValueWidth = showCompartment ? '50%' : '70%';
      const compartmentOptions = this.createCompartmentOptions(compartments);

      const addOnAfterContent = showCompartment ? (
        <span title='compartment id'>comp. id</span>
      ) : undefined;

      return (
        <Actionbar pathItems={breadcrumbPaths} className='mcs-modal_container'>
          <Modal
            title='Enter the user identifier you want to lookup'
            wrapClassName='vertical-center-modal'
            visible={isModalVisible}
            footer={[
              <Button key='back' size='large' onClick={onReturnClick}>
                Return
              </Button>,
              <Button
                disabled={identifierId === null || identifierType === null}
                key='submit'
                type='primary'
                size='large'
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
                <Option value='user_point_id'>User Point Id</Option>
                <Option value='user_account_id'>User Account Id</Option>
                <Option value='user_agent_id'>Vector Id</Option>
                <Option value='email_hash'>Email Hash</Option>
              </Select>
              <Input
                name='value'
                placeholder='input your value'
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
            className='mcs-primary mcs-montioringActionBar_userLookupButton'
            type='primary'
            onClick={onUserLookupClick}
          >
            <McsIcon type='refresh' /> <FormattedMessage {...messages.lookUpUser} />
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
