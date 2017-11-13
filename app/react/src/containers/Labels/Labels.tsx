import React from 'react';
import { connect } from 'react-redux';

import LabelsService from '../../services/LabelsService';
import LabelsSelector from '../../components/LabelsSelector';
import messages from './messages';

export interface Label {
  id: string;
  name: string;
}

interface LabelsProps {
  labellableId: string;
  labellableType: string;
  organisationId: string;
  orgLabels: Label[];
}

interface LabelsState {
  labels: Label[];
  inputVisible: boolean;
  inputValue: string;
  input?: HTMLInputElement;
}

class Labels extends React.Component<LabelsProps, LabelsState> {
  constructor(props: LabelsProps) {
    super(props);
    this.state = {
      labels: [],
      inputVisible: false,
      inputValue: '',
    };
  }

  componentDidMount() {
    const {
      organisationId,
      labellableId,
      labellableType,
    } = this.props;

    this.fetchLabbellableLables(organisationId, labellableId, labellableType);

  }

  componentWillReceiveProps(nextProps: LabelsProps) {
    const {
      organisationId,
      labellableId,
      labellableType,
    } = this.props;

    const {
      organisationId: nextOrganisationId,
      labellableId: nextLabellableId,
      labellableType: nextLabellableType,
    } = nextProps;

    if (labellableId !== nextLabellableId || organisationId !== nextOrganisationId || labellableType !== nextLabellableType) {
      this.fetchLabbellableLables(nextOrganisationId, nextLabellableId, nextLabellableType);
    }
  }

  fetchLabbellableLables = (organisationId: string, labellableId: string, labellableType: string) => {
    LabelsService.getLabels(organisationId, { labelable_id: labellableId, labelable_type: labellableType})
      .then((results: any) => results.data)
      .then((results: Label[]) => (
        this.setState({ labels: results })
      ));
  }

  onChange = (newLabels: Label[]) => {

    if (newLabels.length > this.state.labels.length) {
      const diffToAdd = newLabels.map(newLabel => {
        return this.state.labels.find(label => newLabel.id === label.id) ? null : newLabel;
      }).filter(item => (item && item.id))[0];
      if (diffToAdd) {
        LabelsService.pairLabels(diffToAdd.id, this.props.labellableType, this.props.labellableId);
        this.setState({ labels: [...this.state.labels, diffToAdd] });
      }
    }

    if (newLabels.length < this.state.labels.length) {
      const diffToRemove = this.state.labels.map(label => {
        return newLabels.find(newLabel => newLabel.id === label.id) ? null : label;
      }).filter(item => (item && item.id))[0];

      if (diffToRemove) {
        LabelsService.unPairLabels(diffToRemove.id, this.props.labellableType, this.props.labellableId);
        this.setState({ labels: newLabels });
      }
    }

  }

  render() {
    const { labels } = this.state;
    const { orgLabels } = this.props;

    return (
      <LabelsSelector
        labels={orgLabels}
        selectedLabels={labels}
        onChange={this.onChange}
        buttonMessage={messages.labelButton}
      />
    );
  }
}

export default connect(
  state => ({ orgLabels: state.labels.labelsApi.data }),
)(Labels);
