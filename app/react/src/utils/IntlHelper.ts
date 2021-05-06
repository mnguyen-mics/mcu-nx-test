import { FormattedMessage } from 'react-intl';

const isValidFormattedMessageProps = (object: FormattedMessage.MessageDescriptor) => {
  return object && object.id && object.defaultMessage;
};

export { isValidFormattedMessageProps };
