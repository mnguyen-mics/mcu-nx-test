import * as React from 'react';
import { Layout } from 'antd';
import { NavigatorHeader } from '../../containers/Header';

const NavigatorHeaderJS = NavigatorHeader as any;

interface EditLayoutProps {
  editComponent: new() => React.Component;
}

const EditLayout: React.SFC<EditLayoutProps> = props => {
  const EditComponent = props.editComponent;
  return (
    <Layout className="mcs-fullscreen">
      <NavigatorHeaderJS />
      <EditComponent />
    </Layout>
  );
};

export default EditLayout;
