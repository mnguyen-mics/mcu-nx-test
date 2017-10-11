import * as React from 'react';

interface ButtonStylelessProps {
  className?: string;
  buttonProps?: React.ButtonHTMLAttributes<HTMLButtonElement>;
  onClick: React.FormEventHandler<HTMLButtonElement>;
}

const ButtonStyleless: React.SFC<ButtonStylelessProps> = props => {

  return (
    <button className={`button-styleless ${props.className}`} {...props.buttonProps}>
      {props.children}
    </button>
  );
};

ButtonStyleless.defaultProps = {
  className: '',
};

export default ButtonStyleless;
