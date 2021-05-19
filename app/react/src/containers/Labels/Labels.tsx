import * as React from 'react';
import { connect } from 'react-redux';
import messages from './messages';
import { lazyInject } from '../../config/inversify.config';
import { TYPES } from '../../constants/types';
import { ILabelService } from '../../services/LabelsService';
import { MicsReduxState } from '../../utils/ReduxHelper';
import { LabelsSelector } from '@mediarithmics-private/mcs-components-library';
import { compose } from 'recompose';
import { InjectedIntlProps, injectIntl } from 'react-intl';

export interface Label {
  id: string;
  name: string;
  organisation_id: string;
  creation_ts: number;
}

interface LabelsProps {
  labellableId: string;
  labellableType: string;
  organisationId: string;
}

interface LabelsState {
  labels: Label[];
  inputVisible: boolean;
  inputValue: string;
  input?: HTMLInputElement;
}

type Props = LabelsProps &
  InjectedIntlProps & {
    orgLabels: Label[];
  };

class Labels extends React.Component<Props, LabelsState> {
  @lazyInject(TYPES.ILabelService)
  private _labelService: ILabelService;

  constructor(props: Props) {
    super(props);
    this.state = {
      labels: [],
      inputVisible: false,
      inputValue: '',
    };
  }

  componentDidMount() {
    const { organisationId, labellableId, labellableType } = this.props;

    this.fetchLabbellableLables(organisationId, labellableId, labellableType);
  }

  componentDidUpdate(previousProps: LabelsProps) {
    const { organisationId, labellableId, labellableType } = this.props;

    const {
      organisationId: previousOrganisationId,
      labellableId: previousLabellableId,
      labellableType: previousLabellableType,
    } = previousProps;

    if (
      labellableId !== previousLabellableId ||
      organisationId !== previousOrganisationId ||
      labellableType !== previousLabellableType
    ) {
      this.fetchLabbellableLables(organisationId, labellableId, labellableType);
    }
  }

  fetchLabbellableLables = (
    organisationId: string,
    labellableId: string,
    labellableType: string,
  ) => {
    this._labelService
      .getLabels(organisationId, {
        labelable_id: labellableId,
        labelable_type: labellableType,
      })
      .then((results: any) => results.data)
      .then((results: Label[]) => this.setState({ labels: results }));
  };

  onChange = (newLabels: Label[]) => {
    if (newLabels.length > this.state.labels.length) {
      const diffToAdd = newLabels
        .map(newLabel => {
          return this.state.labels.find(label => newLabel.id === label.id) ? null : newLabel;
        })
        .filter(item => item && item.id)[0];
      if (diffToAdd) {
        this._labelService.pairLabels(
          diffToAdd.id,
          this.props.labellableType,
          this.props.labellableId,
        );
        this.setState({ labels: [...this.state.labels, diffToAdd] });
      }
    }

    if (newLabels.length < this.state.labels.length) {
      const diffToRemove = this.state.labels
        .map(label => {
          return newLabels.find(newLabel => newLabel.id === label.id) ? null : label;
        })
        .filter(item => item && item.id)[0];

      if (diffToRemove) {
        this._labelService.unPairLabels(
          diffToRemove.id,
          this.props.labellableType,
          this.props.labellableId,
        );
        this.setState({ labels: newLabels });
      }
    }
  };

  render() {
    const { labels } = this.state;
    const { orgLabels } = this.props;

    return (
      <LabelsSelector
        labels={orgLabels}
        selectedLabels={labels}
        onChange={this.onChange}
        buttonMessage={this.props.intl.formatMessage(messages.labelButton)}
      />
    );
  }
}

const mapStateToProps = (state: MicsReduxState) => ({
  orgLabels: state.labels.labelsApi.data,
});

export default compose<Props, LabelsProps>(connect(mapStateToProps), injectIntl)(Labels);
