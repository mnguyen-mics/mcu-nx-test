import * as React from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { compose } from 'recompose';

export interface CustomLoaderPlaceholderProps extends WrappedComponentProps {}

const messages = defineMessages({
  placeholder: {
    id: 'creatives.create.loader.empty.placeholder',
    defaultMessage: 'Please fill out the form and save to see a preview of your creative.',
  },
});

class CustomLoaderPlaceholder extends React.Component<CustomLoaderPlaceholderProps, any> {
  render() {
    const { intl } = this.props;
    return (
      <div className='mcs-custom-loader no-loader'>{intl.formatMessage(messages.placeholder)}</div>
    );
  }
}

export default compose<CustomLoaderPlaceholderProps, {}>(injectIntl)(CustomLoaderPlaceholder);
