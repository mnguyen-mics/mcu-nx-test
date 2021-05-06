import { FormattedMessage } from 'react-intl';

export type FormatProperty = (
  p: string,
  v?: string,
) => {
  message: FormattedMessage.MessageDescriptor;
  formattedValue?: React.ReactNode;
};
