import { FormattedMessage } from "react-intl";

export type FieldToMessageFormatMap = {
  [propertyName: string]: {
    message: FormattedMessage.MessageDescriptor,
    formatValue: (value: string | number) => React.ReactNode
  }
};
