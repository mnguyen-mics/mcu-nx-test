import * as React from 'react';
import { Spin } from 'antd';

const Loading: React.SFC<{}> = props => {

  return (
    <div className="mcs-centered-container">
      <Spin size="large" />
    </div>
  );
}

export default Loading;
