import * as React from 'react';
import { Omit } from '../utils/Types';

export interface ButtonStylelessProps {
  onClick?: any;
}

const ButtonStyleless: React.SFC<
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> &
  ButtonStylelessProps
> = props => {

  const { children, className, onClick, ...rest } = props;

  const handleOnClick = (e: React.FormEvent<HTMLButtonElement>) => {
    e.preventDefault();
    onClick();
  };

  const { disabled } = props;

  const style: React.CSSProperties = {
    cursor: disabled ? 'not-allowed' : 'pointer'
  }

  return (
    <button type='button' style={style} className={`button-styleless ${className ? className : ''}`} onClick={disabled ? undefined : handleOnClick} {...rest}>
      {children}
    </button>
  );
};

export default ButtonStyleless;
