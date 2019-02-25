import * as React from 'react';
import CompartmentService from '../../services/CompartmentService'
import { UserAccountCompartmentResource } from '../../models/datamart/DatamartResource';

export interface CompartmentNameDisplayProps {
  userAccountCompartmentId: string;
}

interface State {
  compartment?: UserAccountCompartmentResource;
  loading: boolean;
}

export default class CompartmentannelNameDisplay extends React.Component<CompartmentNameDisplayProps, State> {

  constructor(props: CompartmentNameDisplayProps) {
    super(props);
    this.state = {
      loading: true
    }
  }

  componentDidMount() {
    const {
      userAccountCompartmentId,
    } = this.props;
    this.fetchUserAccountCompartment(userAccountCompartmentId)
  }

  componentWillReceiveProps(nextProps: CompartmentNameDisplayProps) {
    const {
      userAccountCompartmentId
    } = this.props;

    const {
      userAccountCompartmentId: nextUserAccountCompartment
    } = nextProps;

    if (nextUserAccountCompartment !== userAccountCompartmentId) {
      this.fetchUserAccountCompartment(nextUserAccountCompartment)
    }
  }

  fetchUserAccountCompartment = (userAccountCompartmentId: string) => {
    this.setState({ loading: true });
    return CompartmentService.getCompartment(userAccountCompartmentId).then(res => res.data).then(res => this.setState({ loading: false, compartment: res }))
  }

  public render() {

    if (this.state.loading) {
      return <span />
    }

    return this.state.compartment && (
      <span>
        {this.state.compartment.name}
      </span>
    );
  }
}
