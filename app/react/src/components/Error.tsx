import * as React from 'react';

interface ErrorProps {
  message: string;
  style?: React.CSSProperties;
}

const Error: React.SFC<ErrorProps> = ({ message, style }) => {
  return (
    <div className="mcs-centered-container page-error" style={style}>
      <p>{message}</p>
    </div>
  );
};

export default Error;
