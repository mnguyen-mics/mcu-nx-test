import React from 'react';
import { Spin } from 'antd';

function Loading() {
  return (
    <div className="mcs-centered-container">
      <Spin size="large" />
    </div>
  );
}

export default Loading;
