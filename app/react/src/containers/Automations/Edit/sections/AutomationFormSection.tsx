import * as React from 'react';
import ReactAngular from '../../../ReactAngular/ReactAngular';

export interface AngularWidgetProps {
  scenarioContainer: any;
  organisationId: string;
  datamartId: string;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'mcs-scenario': any;
    }
  }
}

const ReactAngularJS = ReactAngular as any;

export default class AngularWidget extends React.Component<AngularWidgetProps> {
  constructor(props: AngularWidgetProps) {
    super(props);
  }

  render() {
    return (
      <ReactAngularJS
        scope={{
          scenarioContainer: this.props.scenarioContainer,
        }}
      >
        <div>
          <mcs-scenario scenario-container="scenarioContainer" />
        </div>
      </ReactAngularJS>
    );
  }
}
