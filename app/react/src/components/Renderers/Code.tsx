import * as React from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/styles/hljs';

export interface CodeProps {
  language: string,
  value: string,
}

export default class Code extends React.Component<CodeProps, any> {
  public render() {
    const {
      language,
      value
    } = this.props;


    return (
      <div>
        <SyntaxHighlighter
          language={language}
          style={docco}
        >
          {value}
        </SyntaxHighlighter>{' '}
      </div>
    );
  }
}
