declare module 'react-scrollspy';

declare module "react-countup" {
  import * as React from "react";

  export interface ComponentProps {
      start: number
      end: number
      duration?: number
      decimals?: number
      useEasing?: boolean
      separator?: string
      decimal?: string
      prefix?: string
      suffix?: string
      className?: string
      redraw?: boolean
      onComplete?: Function
      onStart?: Function
      easingFn?: Function
      formattingFn?: Function
  }

  export default class Form extends React.Component<ComponentProps> { }
}
declare module 'react-syntax-highlighter';
declare module 'react-syntax-highlighter/styles/hljs';
declare module 'react-copy-to-clipboard';
declare module 'react-simple-maps';

declare module 'file-saver';

declare module 'react-dimensions';
