import React, { Component } from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { Button, Modal, Input, Alert } from 'antd';
import { FormattedMessage, injectIntl } from 'react-intl';
import { withMcsRouter } from '../../../Helpers';
import * as labelsActions from '../../../../state/Labels/actions';
import { Label } from '../../../Labels/Labels';
import LabelsService from '../../../../services/LabelsService';

import settingsMessages from '../../messages';
import messages from './messages';

import LabelsTable, { Filters } from './LabelsTable';
import injectNotifications, { InjectedNotificationProps } from '../../../Notifications/injectNotifications';

interface Options {
  limit: number;
}

interface LabelsListProps {
  organisationId: string;
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

class LabelsListPage extends Component<LabelsListProps & InjectedNotificationProps, LabelsListState> {

  constructor(props: LabelsListProps & InjectedNotificationProps) {
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
    this.setState({ modalVisible: true, selectedLabelId: label.id, inputValue: label.name, edition: true });
  }

  handleArchiveLabels = (label: Label, that: LabelsListPage) => {
    Modal.confirm({
      title: 'Do you Want to delete these items?',
      content: 'Some descriptions',
      onOk() {
        LabelsService.deleteLabel(label.id).then(() => {
          that.props.fetchLabels(that.props.organisationId, { limit: 1000 });
        })
        .catch((err: any) => { that.setState({ isCreatingLabels: false }); that.props.notifyError(err); });
      },
      onCancel() {
        // cancel
      },
    });
  }

  buildNewActionElement = () => {
    const onClick = () => {
      this.setState({ modalVisible: true, inputValue: '', selectedLabelId: '' });
    };
    return (
      <Button
        key="new"
        type="primary"
        htmlType="submit"
        onClick={onClick}
      >
        <FormattedMessage {...messages.newLabel} />
      </Button>
    );
  }

  handleOk = () => {
    const { fetchLabels, notifyError, organisationId } = this.props;
    const { selectedLabelId, inputValue } = this.state;
    const promise = selectedLabelId !== '' ?
      LabelsService.updateLabel(selectedLabelId, inputValue, organisationId) :
      LabelsService.createLabel(inputValue, organisationId);

    this.setState({ isCreatingLabels: true },
      () => promise
      .then(() => {
        this.setState({ modalVisible: false, isCreatingLabels: false, selectedLabelId: '', inputValue: '', edition: false });
        fetchLabels(this.props.organisationId, { limit: 1000 });
      })
      .catch((err: any) => { notifyError(err); this.setState({ isCreatingLabels: false }); }),
    );
  }

  handleCancel = () => {
    this.setState({ modalVisible: false, selectedLabelId: '', inputValue: '', isCreatingLabels: false, edition: false });
  }

  handleFilterChange = (newFilter: Filters) => {

    this.setState({ filter: newFilter });
  }

  buildModalFooter = () => {
    const { hasError, isCreatingLabels } = this.state;
    return (
      <div>
        <Button onClick={this.handleCancel}>
          <FormattedMessage {...messages.cancelLabel} />
        </Button>
        <Button type="primary" onClick={this.handleOk} loading={isCreatingLabels} disabled={hasError}>
          <FormattedMessage {...messages.saveLabel} />
        </Button>
      </div>
    );
  }

  render() {
    const {
      totalLabels,
      hasLabels,
      filter,
      hasError,
      edition,
    } = this.state;

    const {
      isFetching,
      labels,
    } = this.props;

    const newButton = this.buildNewActionElement();
    const buttons = [newButton];

    const onChange = (e: any) => this.setState({
      inputValue: e.target.value,
      hasError: labels.find(label => label.name === e.target.value) ? true : false,
    });
    const onLabelArchive = (label: Label) => { this.handleArchiveLabels(label, this); };

    return (
      <div>
        <div className="mcs-card-header mcs-card-title">
          <span className="mcs-card-title"><FormattedMessage {...settingsMessages.labels} /></span>
          <span className="mcs-card-button">{buttons}</span>
        </div>
        <hr className="mcs-separator" />
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
        {this.state.modalVisible ? <Modal
          title={edition ? <FormattedMessage {...messages.editLabelTitle} /> : <FormattedMessage {...messages.addNewLabelTitle} />}
          visible={this.state.modalVisible}
          footer={this.buildModalFooter()}
          onCancel={this.handleCancel}
        >
          {hasError ?
            <Alert message={<FormattedMessage {...messages.labelAlreadyExists} />} type="error" style={{ marginBottom: 16 }} />
            : null}
          <Input defaultValue={this.state.inputValue} onChange={onChange} placeholder="Name" />
        </Modal> : null}
      </div>
    );
  }
}

export default compose(
  injectIntl,
  withMcsRouter,
  injectNotifications,
  connect(
    (state: any) => ({
      labels: state.labels.labelsApi.data,
      isFetching: state.labels.labelsApi.isFetching,
    }),
    { fetchLabels: labelsActions.fetchAllLabels.request,
    },
  ),
)(LabelsListPage);
