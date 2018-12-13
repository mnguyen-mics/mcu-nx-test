import * as React from 'react';

export interface ParagraphProps extends React.HTMLAttributes<HTMLDivElement> {
}

export default class Paragraph extends React.Component<ParagraphProps, any> {
  public render() {
    const {
      children,
      ...rest
    } = this.props;

    return (
      <div className='paragraph' {...rest}>
        {children}
      </div>
    );
  }
}
