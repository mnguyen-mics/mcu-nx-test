import { FormattedMessage } from "react-intl";

export interface NavigatorMenuElement {
    key: string;
    iconType?: string;
    path: string;
    translation: FormattedMessage.MessageDescriptor;
    translationId?: string;
    legacyPath?: boolean;
    subMenuItems?: NavigatorMenuElement[];
  }