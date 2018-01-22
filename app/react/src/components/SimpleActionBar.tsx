import * as React from 'react';
import {FormattedMessage} from 'react-intl';
import ActionBar from './ActionBar';

export const SimpleActionBar = (title: FormattedMessage.MessageDescriptor): React.SFC<{}> => () => {
  return <ActionBar paths={[{name: title}]} />;
};
