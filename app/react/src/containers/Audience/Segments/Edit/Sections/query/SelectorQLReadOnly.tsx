import * as React from 'react';
import ReactAngular from '../../../../../ReactAngular/ReactAngular';
import { FormattedMessage } from 'react-intl';

export interface AngularWidgetProps {
  queryContainer: any;
}

const messageProps = {
  id: 'audience.segments.form.selectorQLQueryContainer.undefined',
  defaultMessage: 'Undefined Query container'
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'mcs-query-read-only-view': any;
    }
  }
}

const ReactAngularJS = ReactAngular as any;

export default class AngularWidget extends React.Component<AngularWidgetProps> {
  constructor(props: AngularWidgetProps) {
    super(props);

    // (window as any).angular.element(document.body).injector().get('core/common/auth/Session').init(`o${this.props.organisationId}d${this.props.datamartId}`);
  }

  render() {
    return this.props.queryContainer ? (
      <ReactAngularJS
        scope={{
          container: this.props.queryContainer,
        }}
      >
        <div>
          <mcs-query-read-only-view query-container="container" />
        </div>
      </ReactAngularJS>
    ) : (
      <FormattedMessage {...messageProps} />
    );
  }
}
