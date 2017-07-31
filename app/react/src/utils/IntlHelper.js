const isValidFormattedMessageProps = object => {
  return object && object.id && object.defaultMessage;
};

export { isValidFormattedMessageProps };
