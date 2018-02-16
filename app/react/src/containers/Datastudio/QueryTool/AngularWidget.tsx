import * as React from 'react';
import ReactAngular from '../../ReactAngular/ReactAngular';


export interface AngularWidgetProps {
  datamartId: string;
  organisationId: string;
  getContainer: any;
}

interface AngularWidgetState {
  QueryContainer: any,
}

declare global { namespace JSX { interface IntrinsicElements {"mcs-query-tool": any } } }


const ReactAngularJS = ReactAngular as any;

export default class AngularWidget extends React.Component<AngularWidgetProps, AngularWidgetState> {

  container = (window as any).angular.element(document.body).injector().get('core/datamart/queries/QueryContainer');

  constructor(props: AngularWidgetProps) {
    super(props);
    const Container = this.container;
    this.state = {
      QueryContainer: new Container(this.props.datamartId)
    };
    
    (window as any).angular.element(document.body).injector().get('core/common/auth/Session').init(`o${this.props.organisationId}d${this.props.datamartId}`);
   
  }

  render() {
    this.props.getContainer(this.state.QueryContainer)

    return this.container ? (
      <ReactAngularJS
        scope={{
          container: this.state.QueryContainer,
          organisationId: this.props.organisationId,
          datamartId: this.props.datamartId,
        }}
      >
        <div>
        <mcs-query-tool query-container="container" statistics-enabled="true" selected-values-enabled="true" datamart-id="datamartId" organisation-id="organisationId" />
        </div>
      </ReactAngularJS>
    ) : 'error';
  }
}