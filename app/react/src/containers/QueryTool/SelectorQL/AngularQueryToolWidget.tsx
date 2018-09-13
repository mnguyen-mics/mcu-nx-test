import * as React from 'react';
import ReactAngular from '../../ReactAngular/ReactAngular';
import { QueryResource } from '../../../models/datamart/DatamartResource';


export interface AngularQueryToolWidgetProps {
  datamartId: string;
  organisationId: string;
  setStateWithQueryContainer: (queryContainer: QueryContainer) => void;
}

export interface QueryContainer {
  saveOrUpdate: () => Promise<QueryResource>
}

interface AngularQueryToolWidgetState {
  sessionInitialized: boolean,
}

declare global { namespace JSX { interface IntrinsicElements { "mcs-query-tool": any } } }


const ReactAngularJS = ReactAngular as any;

export default class AngularQueryToolWidget extends React.Component<AngularQueryToolWidgetProps, AngularQueryToolWidgetState> {

  AngularQueryContainer = (window as any).angular.element(document.body).injector().get('core/datamart/queries/QueryContainer');
  AngularSession = (window as any).angular.element(document.body).injector().get('core/common/auth/Session');
  queryContainer: QueryContainer

  constructor(props: AngularQueryToolWidgetProps) {
    super(props);
    this.state = { sessionInitialized: false }
    this.queryContainer = new this.AngularQueryContainer(this.props.datamartId)
  }

  componentDidMount() {
    this.props.setStateWithQueryContainer(this.queryContainer);
    this.AngularSession.init(`o${this.props.organisationId}d${this.props.datamartId}`).then(() => this.setState({ sessionInitialized: true }))
  }

  render() {
    return this.AngularQueryContainer && this.state.sessionInitialized ? (
      <ReactAngularJS
        scope={{
          container: this.queryContainer,
          organisationId: this.props.organisationId,
          datamartId: this.props.datamartId,
        }}
      >
        <mcs-query-tool query-container="container" statistics-enabled="true" selected-values-enabled="true" datamart-id="datamartId" organisation-id="organisationId" />
      </ReactAngularJS>
    ) : 'error';
  }
}