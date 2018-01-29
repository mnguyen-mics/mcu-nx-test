import * as React from 'react';
import { Transition } from 'react-transition-group';

interface SlideProps {
  toShow: boolean;
  content: JSX.Element;
  horizontal?: boolean;
}

class Slide extends React.Component<SlideProps> {
  render() {
    const duration = 120;

    const defaultStyle = !this.props.horizontal
      ? {
          transition: `height ${duration}ms ease-in-out`,
          display: 'block',
          height: '0px',
          opacity: 0,
          textAlign: 'center',
          marginBottom: '25px',
        }
      : {
          transition: `width ${duration}ms ease-in-out`,
          width: '0px',
          height: '0px',
          opacity: 0,
          textAlign: 'center',
        };

    const transitionStyles: React.CSSProperties = !this.props.horizontal
      ? {
          entering: { height: '0px', opacity: 0 },
          entered: { height: '50px', opacity: 1 },
        }
      : {
          entering: { width: '0px', opacity: 0 },
          entered: { width: '85px', opacity: 1, display: 'inline-block' },
        };

    return (
      <Transition in={this.props.toShow} timeout={duration}>
        {(state: any) => (
          <div
            style={{
              ...defaultStyle,
              ...transitionStyles[state],
            }}
          >
            {this.props.content}
          </div>
        )}
      </Transition>
    );
  }
}

export default Slide;
