import * as React from 'react';
import ReactAngular from '../../../ReactAngular/ReactAngular';
import { FormattedMessage } from 'react-intl';
import { AutomationFormData } from '../domain';

const messageProps = {
  id: 'automation.form.scenario-container.undefined',
  defaultMessage: 'Undefined scenario container'
}

export interface AngularWidgetProps {
  scenarioContainer: any;
  organisationId: string;
  datamartId: string;
  initialValues: Partial<AutomationFormData>;
}

interface AngularWidgetState {
  sessionInitialized: boolean
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
    this.state  = {
      sessionInitialized: false,
    }

  }

  render() {
    return this.props.scenarioContainer.scenario.id || (this.props.initialValues.automation && !this.props.initialValues.automation.id) ? (
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
