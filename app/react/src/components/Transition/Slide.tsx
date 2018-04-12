import * as React from 'react';
import { Transition } from 'react-transition-group';

interface SlideProps {
  toShow: boolean;
  content: React.ReactNode;
  horizontal?: boolean;
}

class Slide extends React.Component<SlideProps> {
  render() {
    const duration = 120;

    const { toShow } = this.props;

    const defaultStyle = !this.props.horizontal
      ? {
          transition: `height ${duration}ms ease-in-out`,
          display: 'block',
          height: '0px',
          opacity: 0,
          textAlign: 'center',
        }
      : {
          transition: `width ${duration}ms ease-in-out`,
          width: '0px',
          height: '0px',
          opacity: 0,
          textAlign: 'center',
          display: 'inline-block',
        };

    const transitionStyles: React.CSSProperties = !this.props.horizontal
      ? {
          entering: { height: '0px', opacity: 0 },
          entered: { height: '50px', opacity: 1 },
        }
      : {
          entering: { width: '0px', opacity: 0 },
          entered: { width: '120px', opacity: 1 }, // pas scalable
        };

    return (
      <Transition in={toShow} timeout={duration}>
        {(state: any) => (
          <div
            style={{
              ...defaultStyle,
              ...transitionStyles[state],
            }}
          >
            { toShow && this.props.content}
          </div>
        )}
      </Transition>
    );
  }
}

export default Slide;
