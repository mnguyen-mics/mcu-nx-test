import * as React from 'react';
import { Spin } from 'antd';

const Loading: React.SFC<{ className?: string }> = props => {

  return (
    <div className={`mcs-centered-container ${props.className}`}>
      <Spin size="large" />
    </div>
  );
};

Loading.defaultProps = {
  className: '',
};

export default Loading;
