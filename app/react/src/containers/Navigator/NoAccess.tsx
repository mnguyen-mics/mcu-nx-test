import * as React from 'react';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import messages from './messages';
import { compose } from 'recompose';
import { Error } from '@mediarithmics-private/mcs-components-library';

type Props = InjectedIntlProps;

class NoAccess extends React.Component<Props> {
  render() {
    const {
      intl
    } = this.props;
  
    return (
      <div style={{ display: 'flex', flex: 1 }}>
        <Error message={intl.formatMessage(messages.noAccess)} />
      </div>
    );
  }
}

export default compose(injectIntl)(NoAccess);
