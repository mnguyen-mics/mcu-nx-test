import * as React from 'react';
import { Layout } from 'antd';
import { NavigatorHeader } from '../../../containers/Header';

interface EditLayoutProps {
  editComponent: React.ComponentType;
}

const EditLayout: React.SFC<EditLayoutProps> = props => {
  const EditComponent = props.editComponent;
  return (
    <Layout id='mcs-full-page' className='mcs-fullscreen'>
      <NavigatorHeader isInSettings={false} />
      <EditComponent />
    </Layout>
  );
};

export default EditLayout;
