import * as React from 'react';
import { Omit } from '../utils/Types';
import { shadeColor } from '../utils/ColorHelpers';

export interface ColoredButtonProps {
  onClick?: any;
  backgroundColor: string;
  color: string;
}

type Props = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> &
  ColoredButtonProps;

interface State {
  isOver: boolean;
}

const BORDER_BRIGHTNESS = -0.1;
const BACKGROUNT_BRIGHTNESS_HOVER = 0.2;



export default class ColoredButton extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      isOver: false,
    };
  }

  public render() {
    const { children, className, onClick, backgroundColor, color, ...rest } = this.props;
    const { isOver } = this.state;

    const handleOnClick = (e: React.FormEvent<HTMLButtonElement>) => {
      e.preventDefault();
      onClick();
    };

    const onMouseOver = () => this.setState({ isOver: true });
    const onMouseOut = () => this.setState({ isOver: false });

    const hoveredStyle: React.CSSProperties = {
      backgroundColor: shadeColor(backgroundColor, BACKGROUNT_BRIGHTNESS_HOVER),
      color: color,
      borderColor: shadeColor(backgroundColor, BORDER_BRIGHTNESS)
    }

    const defaultStyle: React.CSSProperties = {
      backgroundColor: backgroundColor,
      color: color,
      borderColor: shadeColor(backgroundColor, BORDER_BRIGHTNESS)
    }

    return (
      <button
        style={isOver ? hoveredStyle : defaultStyle}
        onMouseOver={onMouseOver}
        onMouseOut={onMouseOut}
        className={`ant-btn mcs-primary ant-btn-primary ${
          className ? className : ''
        }`}
        onClick={handleOnClick}
        {...rest}
      >
        {children}
      </button>
    );
  }
}
