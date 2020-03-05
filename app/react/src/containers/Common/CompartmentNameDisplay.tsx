import * as React from 'react';
import { IComparmentService } from '../../services/CompartmentService'
import { UserAccountCompartmentResource } from '../../models/datamart/DatamartResource';
import { lazyInject } from '../../config/inversify.config';
import { TYPES } from '../../constants/types';

export interface CompartmentNameDisplayProps {
  userAccountCompartmentId: string;
  onLoad?: (compartment?: UserAccountCompartmentResource) => void
}

interface State {
  compartment?: UserAccountCompartmentResource;
  loading: boolean;
}

export default class CompartmentNameDisplay extends React.Component<CompartmentNameDisplayProps, State> {

  @lazyInject(TYPES.ICompartmentService)
  private _compartmentService: IComparmentService;

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

  componentDidUpdate(previousProps: CompartmentNameDisplayProps) {
    const {
      userAccountCompartmentId
    } = this.props;

    const {
      userAccountCompartmentId: previousUserAccountCompartmentId
    } = previousProps;

    if (previousUserAccountCompartmentId !== userAccountCompartmentId) {
      this.fetchUserAccountCompartment(userAccountCompartmentId)
    }
  }

  fetchUserAccountCompartment = (userAccountCompartmentId: string) => {
    this.setState({ loading: true });
    return this._compartmentService.getCompartment(userAccountCompartmentId)
      .then(res => res.data).then(res => this.setState({ loading: false, compartment: res }, () => this.props.onLoad && this.props.onLoad(res)))
      .catch(() => this.setState({ loading: false }))
  }

  public render() {

    if (this.state.loading) {
      return <span />
    }

    return this.state.compartment ? (
      <span>
        {this.state.compartment.name ? this.state.compartment.name : this.state.compartment.token ? this.state.compartment.token : this.state.compartment.id}
      </span>
    ) : <span>{this.props.userAccountCompartmentId}</span>;
  }
}
