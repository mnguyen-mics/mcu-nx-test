import * as React from 'react';

export interface IframeSupportProps {
  content: string;
}

export interface IframeSupportState {
  iframeHeight: number;
}

export default class IframeSupport extends React.Component<IframeSupportProps, IframeSupportState> {
  constructor(props: IframeSupportProps) {
    super(props);
    this.state = {
      iframeHeight: 0,
    };
  }

  render() {
    return (
      <div>
        <iframe
          sandbox='allow-same-origin'
          scrolling='no'
          style={{
            width: '100%',
            height: this.state.iframeHeight,
            margin: 0,
            padding: 0,
            border: 'none',
          }}
          ref={e => {
            if (
              e &&
              e.contentDocument &&
              e.contentDocument.body &&
              e.contentDocument.documentElement
            ) {
              // get inner dimension and set it to global iframe
              e.contentDocument.body.innerHTML = this.props.content;
              const body = e.contentDocument.body,
                html = e.contentDocument.documentElement;

              setTimeout(() => {
                const height = Math.max(
                  body.scrollHeight,
                  body.offsetHeight,
                  html.clientHeight,
                  html.scrollHeight,
                  html.offsetHeight,
                );
                if (this.state.iframeHeight !== height) {
                  this.setState({ iframeHeight: height });
                }
              }, 500);
            }
          }}
        />
      </div>
    );
  }
}
