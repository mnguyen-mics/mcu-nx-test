import * as React from 'react';
import ReactMarkdown from 'react-markdown';
import renderers from './Renderers'

export interface MarkdownProps {
  source: string;
}

export default class Markdown extends React.Component<MarkdownProps, any> {
  public render() {
    const {
      source
    } = this.props;

    return (
      <div className="markdown">
        <ReactMarkdown source={source} renderers={renderers} />
      </div>
    );
  }
}
