import * as React from 'react';
import { Omit } from '../utils/Types';

export interface ButtonStylelessProps {
  onClick: any;
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

  return (
    <button className={`button-styleless ${className}`} onClick={handleOnClick} {...rest}>
      {children}
    </button>
  );
};

export default ButtonStyleless;
