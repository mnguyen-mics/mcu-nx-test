import * as React from 'react';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import messages from './messages';
import Error from '../../components/Error';
import { compose } from 'recompose';

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
