import * as React from 'react';

import ScrollspyImport from 'react-scrollspy';

interface ScrollspyProps {
  items: string[];
  currentClassName: string;
  scrolledPastClassName?: string;
  componentTag?: string;
  style?: any;
  offset?: number;
  rootEl?: string;
  onUpdate?: () => void;
}

const Scrollspy: React.ComponentClass<ScrollspyProps> = ScrollspyImport as any;

export default Scrollspy;
