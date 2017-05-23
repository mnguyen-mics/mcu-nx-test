import React, { Component } from 'react';
import { Layout, Row } from 'antd';

// import { NavigatorHeader } from '../../containers/Header';

const { Content } = Layout;

const EditLayout = (components) => {
  const {
    ActionBar,
    EditContent,
    Stepper
  } = components;

  return class extends Component {
    render() {
      return (
        <Layout>
          {/* <NavigatorHeader />*/}
          <ActionBar />
          <Layout>
            <Stepper />
            <Content>
              <Row>
                <EditContent />
              </Row>
            </Content>
          </Layout>
        </Layout>
      );
    }
  };
};

export default EditLayout;
