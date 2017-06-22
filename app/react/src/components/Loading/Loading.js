import React, { Component } from 'react';
import { Spin } from 'antd';

class Loading extends Component {
  render() {
    return (
      <div className="mcs-centered-container">
        <Spin size="large" />
      </div>
    );
  }
}

export default Loading;
