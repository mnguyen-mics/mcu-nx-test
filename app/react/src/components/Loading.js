import React from 'react';
import { Spin } from 'antd';

function Loading(props) {
  return (
    <div className="mcs-centered-container" {...props}>
      <Spin size="large" />
    </div>
  );
}

export default Loading;
