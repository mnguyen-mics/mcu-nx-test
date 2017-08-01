import React from 'react';
import PropTypes from 'prop-types';
import { Layout } from 'antd';

import { NavigatorHeader } from '../../containers/Header';

function EditLayout({ editComponent: EditComponent }) {
  return (
    <Layout className="mcs-fullscreen">
      <NavigatorHeader />
      <EditComponent />
    </Layout>
  );
}

EditLayout.propTypes = {
  editComponent: PropTypes.func.isRequired,
};

export default EditLayout;
