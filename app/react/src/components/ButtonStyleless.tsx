import * as React from 'react';
import PropTypes from 'prop-types';

interface ButtonStylelessProps {
  children: React.ReactNode;
  className?: string;
  buttonProps: object;
}

//function ButtonStyleless({ children, className, ...buttonProps }) {
const ButtonStyleless: React.SFC<ButtonStylelessProps> = props => {
  return (
    <button className={`button-styleless ${props.className}`} {...props.buttonProps}>
      {props.children}
    </button>
  );
}

ButtonStyleless.defaultProps = {
  className: '',
};

export default ButtonStyleless;
