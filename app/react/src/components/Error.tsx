import * as React from 'react';

interface ErrorProps {
  message: string;
}

const Error: React.SFC<ErrorProps> = ({ message }) => {
  return (
    <div className="mcs-centered-container page-error">
      <p>{message}</p>
    </div>
  );
};

export default Error;
