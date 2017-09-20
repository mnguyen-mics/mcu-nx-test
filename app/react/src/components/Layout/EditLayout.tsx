import * as React from 'react';
import PropTypes from 'prop-types';
import { Layout } from 'antd';
import { NavigatorHeader } from '../../containers/Header';

interface EditLayoutProps {
  editComponent: ()=> HTMLElement;
}

const EditLayout = ({editComponent: EditComponent}) => {
  return (
    <Layout className="mcs-fullscreen">
      <NavigatorHeader />
      <EditComponent />
    </Layout>
  );
}

export default EditLayout;
