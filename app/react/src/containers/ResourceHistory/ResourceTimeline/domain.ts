import { MessageDescriptor } from 'react-intl';

export type FormatProperty = (
  p: string,
  v?: string,
) => {
  message: MessageDescriptor;
  formattedValue?: React.ReactNode;
};
