import * as React from 'react';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import messages from './messages';
import Error from '../../components/Error';
import { compose } from 'recompose';

export interface NoAccessProps {}

type Props = InjectedIntlProps & NoAccessProps;

class NoAccess extends React.Component<Props, any> {
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
