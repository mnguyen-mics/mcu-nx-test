import * as React from 'react';
import { defineMessages, injectIntl, InjectedIntlProps } from 'react-intl';
import { compose } from 'recompose';

export interface NotSupportedPlaceholderProps extends InjectedIntlProps {}

const messages = defineMessages({
  placeholder: {
    id: 'creatives.create.loader.notSupported.placeholder',
    defaultMessage:
      'This plugin has been deprecated. Please contact your plugin developer if you wish to migrate your creative.',
  },
});

class NotSupportedPlaceholder extends React.Component<NotSupportedPlaceholderProps, any> {
  render() {
    const { intl } = this.props;
    return (
      <div className='mcs-custom-loader no-loader'>{intl.formatMessage(messages.placeholder)}</div>
    );
  }
}

export default compose<NotSupportedPlaceholderProps, {}>(injectIntl)(NotSupportedPlaceholder);
