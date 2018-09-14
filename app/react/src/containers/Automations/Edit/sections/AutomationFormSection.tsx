import * as React from 'react';
import ReactAngular from '../../../ReactAngular/ReactAngular';
import { FormattedMessage } from 'react-intl';

const messageProps = {
  id: 'automation.form.scenario-container.undefined',
  defaultMessage: 'Undefined scenario container'
}

export interface AngularWidgetProps {
  scenarioContainer: any;
  organisationId: string;
  datamartId: string;
}

interface AngularWidgetState {
  QueryContainer: any;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'mcs-scenario': any;
    }
  }
}

const ReactAngularJS = ReactAngular as any;

export default class AngularWidget extends React.Component<
  AngularWidgetProps,
  AngularWidgetState
> {
  constructor(props: AngularWidgetProps) {
    super(props);
    
    (window as any).angular
      .element(document.body)
      .injector()
      .get('core/common/auth/Session')
      .init(`o${props.organisationId}d${props.datamartId}`);
  }

  render() {
    return this.props.scenarioContainer ? (
      <ReactAngularJS
        scope={{
          scenarioContainer: this.props.scenarioContainer,
        }}
      >
        <div>
          <mcs-scenario scenario-container="scenarioContainer" />
        </div>
      </ReactAngularJS>
    ) : (
      <FormattedMessage {...messageProps} />
    ); 
  }
}
