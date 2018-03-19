export interface NavigatorMenuElement {
    key: string;
    iconType?: string;
    path: string;
    translation: {id: string, defaultMessage: string};
    translationId?: string;
    legacyPath?: boolean;
    subMenuItems?: NavigatorMenuElement[];
  }