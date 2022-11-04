import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { Row, Button, Modal, Input, Alert, Layout } from 'antd';
import { FormattedMessage, injectIntl, InjectedIntlProps } from 'react-intl';
import * as labelsActions from '../../../../redux/Labels/actions';
import { Label } from '../../../Labels/Labels';
import settingsMessages from '../../messages';
import messages from './messages';
import LabelsTable, { Filters } from './LabelsTable';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../Notifications/injectNotifications';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { lazyInject } from '../../../../config/inversify.config';
import { ILabelService } from '../../../../services/LabelsService';
import { TYPES } from '../../../../constants/types';
import { MicsReduxState } from '@mediarithmics-private/advanced-components';

const { Content } = Layout;
interface Options {
  limit: number;
}

interface LabelsListProps {
  labels: Label[];
  isFetching: boolean;
  fetchLabels: (organisationId: string, options: Options) => void;
}

interface LabelsListState {
  totalLabels: number;
  isCreatingLabels: boolean;
  isFetchingLabels: boolean;
  modalVisible: boolean;
  hasLabels: boolean;
  filter: Filters;
  inputValue: string;
  selectedLabelId: string;
  hasError: boolean;
  edition: boolean;
}

type Props = LabelsListProps &
  InjectedIntlProps &
  InjectedNotificationProps &
  RouteComponentProps<{ organisationId: string }>;

class LabelsListPage extends React.Component<Props, LabelsListState> {
  @lazyInject(TYPES.ILabelService)
  private _labelService: ILabelService;

  constructor(props: Props) {
    super(props);
    this.state = {
      totalLabels: 0,
      isFetchingLabels: true,
      isCreatingLabels: false,
      modalVisible: false,
      hasLabels: false,
      filter: {
        currentPage: 1,
        pageSize: 10,
      },
      inputValue: '',
      selectedLabelId: '',
      hasError: false,
      edition: false,
    };
  }

  handleEditLabels = (label: Label) => {
    this.setState({
      modalVisible: true,
      selectedLabelId: label.id,
      inputValue: label.name,
      edition: true,
    });
  };

  handleArchiveLabels = (label: Label, that: LabelsListPage) => {
    const {
      match: {
        params: { organisationId },
      },
      intl,
    } = this.props;
    const deleteLabel = () => {
      this._labelService
        .deleteLabel(label.id)
        .then(() => {
          that.props.fetchLabels(organisationId, { limit: 1000 });
        })
        .catch((err: any) => {
          that.setState({ isCreatingLabels: false });
          that.props.notifyError(err);
        });
    };
    Modal.confirm({
      title: intl.formatMessage(messages.archiveModalTitle),
      onOk() {
        deleteLabel();
      },
      onCancel() {
        // cancel
      },
    });
  };

  buildNewActionElement = () => {
    const onClick = () => {
      this.setState({
        modalVisible: true,
        inputValue: '',
        selectedLabelId: '',
      });
    };
    return (
      <Button key='new' type='primary' htmlType='submit' onClick={onClick}>
        <FormattedMessage {...messages.newLabel} />
      </Button>
    );
  };

  handleOk = () => {
    const {
      fetchLabels,
      notifyError,
      match: {
        params: { organisationId },
      },
    } = this.props;
    const { selectedLabelId, inputValue } = this.state;
    const promise =
      selectedLabelId !== ''
        ? this._labelService.updateLabel(selectedLabelId, inputValue, organisationId)
        : this._labelService.createLabel(inputValue, organisationId);

    this.setState({ isCreatingLabels: true }, () =>
      promise
        .then(() => {
          this.setState({
            modalVisible: false,
            isCreatingLabels: false,
            selectedLabelId: '',
            inputValue: '',
            edition: false,
          });
          fetchLabels(organisationId, { limit: 1000 });
        })
        .catch((err: any) => {
          notifyError(err);
          this.setState({ isCreatingLabels: false });
        }),
    );
  };

  handleCancel = () => {
    this.setState({
      modalVisible: false,
      selectedLabelId: '',
      inputValue: '',
      isCreatingLabels: false,
      edition: false,
    });
  };

  handleFilterChange = (newFilter: Filters) => {
    this.setState({ filter: newFilter });
  };

  buildModalFooter = () => {
    const { hasError, isCreatingLabels } = this.state;
    return (
      <div>
        <Button onClick={this.handleCancel}>
          <FormattedMessage {...messages.cancelLabel} />
        </Button>
        <Button
          type='primary'
          onClick={this.handleOk}
          loading={isCreatingLabels}
          disabled={hasError}
        >
          <FormattedMessage {...messages.saveLabel} />
        </Button>
      </div>
    );
  };

  render() {
    const { totalLabels, hasLabels, filter, hasError, edition } = this.state;

    const { isFetching, labels } = this.props;

    const newButton = this.buildNewActionElement();
    const buttons = [newButton];

    const onChange = (e: any) =>
      this.setState({
        inputValue: e.target.value,
        hasError: labels.find(label => label.name === e.target.value) ? true : false,
      });
    const onLabelArchive = (label: Label) => {
      this.handleArchiveLabels(label, this);
    };

    return (
      <div className='ant-layout'>
        <Content className='mcs-content-container'>
          <Row className='mcs-table-container'>
            <div className='mcs-modal_container'>
              <div className='mcs-card-header mcs-card-title'>
                <span className='mcs-card-title'>
                  <FormattedMessage {...settingsMessages.labels} />
                </span>
                <span className='mcs-card-button'>{buttons}</span>
              </div>
              <hr className='mcs-separator' />
              <LabelsTable
                dataSource={labels}
                totalLabels={totalLabels}
                isFetchingLabels={isFetching}
                noLabelYet={hasLabels}
                filter={filter}
                onFilterChange={this.handleFilterChange}
                onLabelArchive={onLabelArchive}
                onLabelEdit={this.handleEditLabels}
              />
              <Modal
                title={
                  edition ? (
                    <FormattedMessage {...messages.editLabelTitle} />
                  ) : (
                    <FormattedMessage {...messages.addNewLabelTitle} />
                  )
                }
                visible={this.state.modalVisible}
                footer={this.buildModalFooter()}
                onCancel={this.handleCancel}
              >
                {hasError ? (
                  <Alert
                    message={<FormattedMessage {...messages.labelAlreadyExists} />}
                    type='error'
                    style={{ marginBottom: 16 }}
                  />
                ) : null}
                <Input
                  defaultValue={this.state.inputValue}
                  onChange={onChange}
                  placeholder='Name'
                />
              </Modal>
            </div>
          </Row>
        </Content>
      </div>
    );
  }
}

export default compose(
  injectIntl,
  withRouter,
  injectNotifications,
  connect(
    (state: MicsReduxState) => ({
      labels: state.labels.labelsApi.data,
      isFetching: state.labels.labelsApi.isFetching,
    }),
    { fetchLabels: labelsActions.fetchAllLabels.request },
  ),
)(LabelsListPage);
