import * as React from 'react';
import ReactAngular from '../../../ReactAngular/ReactAngular';
import { FormattedMessage } from 'react-intl';
import { Spin } from 'antd';

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

  AngularSession = (window as any).angular.element(document.body).injector().get('core/common/auth/Session')

  constructor(props: AngularWidgetProps) {
    super(props);
    this.state  = {
      sessionInitialized: false,
    }

  }
  componentDidMount() {
    this.AngularSession.init(`o&{props.organisationId}d${this.props.datamartId}`)
    .then(() => {
      this.setState({ sessionInitialized: true })
    })
    .catch(() => this.setState({ sessionInitialized: true }))
  }


  render() {
    if (!this.state.sessionInitialized) {
      return <Spin />
    }

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
