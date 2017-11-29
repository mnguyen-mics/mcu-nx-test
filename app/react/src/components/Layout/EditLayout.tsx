import * as React from 'react';
import { Layout } from 'antd';
import { NavigatorHeader } from '../../containers/Header';

const NavigatorHeaderTS: any = NavigatorHeader;

interface EditLayoutProps {
  editComponent: new() => React.Component;
}

const EditLayout: React.SFC<EditLayoutProps> = props => {
  const EditComponent = props.editComponent;
  return (
    <Layout className="mcs-fullscreen">
      <NavigatorHeaderTS />
      <EditComponent />
    </Layout>
  );
};

export default EditLayout;
