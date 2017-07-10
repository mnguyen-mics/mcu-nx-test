import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Layout } from 'antd';

import { NavigatorHeader } from '../../containers/Header';

class EditLayout extends Component {

  render() {

    const { editComponent: EditComponent } = this.props;

    return (
      <Layout id="mcs-edit-layout" className="mcs-fullscreen">
        <NavigatorHeader />
        <EditComponent />
      </Layout>
    );
  }
}

EditLayout.propTypes = {
  editComponent: PropTypes.func.isRequired
};

export default EditLayout;
