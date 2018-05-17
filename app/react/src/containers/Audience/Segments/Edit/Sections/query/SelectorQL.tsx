import * as React from 'react';
import ReactAngular from '../../../../../ReactAngular/ReactAngular';


export interface AngularWidgetProps {
  datamartId: string;
  organisationId: string;
  queryContainer: any;
}

interface AngularWidgetState {
  QueryContainer: any,
}

declare global { namespace JSX { interface IntrinsicElements {"mcs-query-tool": any } } }


const ReactAngularJS = ReactAngular as any;

export default class AngularWidget extends React.Component<AngularWidgetProps, AngularWidgetState> {

  constructor(props: AngularWidgetProps) {
    super(props);
    
    (window as any).angular.element(document.body).injector().get('core/common/auth/Session').init(`o${this.props.organisationId}d${this.props.datamartId}`);
   
  }

  render() {
    return this.props.queryContainer ? (
      <ReactAngularJS
        scope={{
          container: this.props.queryContainer,
          organisationId: this.props.organisationId,
          datamartId: this.props.datamartId,
        }}
      >
        <div>
        <mcs-query-tool query-container="container" statistics-enabled="false" selected-values-enabled="true" datamart-id="datamartId" organisation-id="organisationId" />
        </div>
      </ReactAngularJS>
    ) : null;
  }
}