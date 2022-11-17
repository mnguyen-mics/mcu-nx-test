import { MessageDescriptor } from 'react-intl';

const isValidFormattedMessageProps = (object: MessageDescriptor) => {
  return object && object.id && object.defaultMessage;
};

export { isValidFormattedMessageProps };
