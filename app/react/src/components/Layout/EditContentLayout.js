import React from 'react';
import PropTypes from 'prop-types';
import { Layout, Form } from 'antd';

import SidebarWrapper from '../Partials/SidebarWrapper';
import ActionbarWrapper from '../Partials/ActionbarWrapper';


function EditContentLayout({
  breadcrumbPaths,
  children,
  sidebarItems,
  submitMetadata,
  url
}) {

  return (
    <Layout>
      <Form className="edit-layout ant-layout" onSubmit={submitMetadata.onSubmit}>
        <ActionbarWrapper
          {...submitMetadata}
          breadcrumbPaths={breadcrumbPaths}
        />

        <Layout>
          <SidebarWrapper items={sidebarItems} url={url} />
          <Layout>{children}</Layout>
        </Layout>

      </Form>
    </Layout>
  );
}

EditContentLayout.propTypes = {
  breadcrumbPaths: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string.isRequired,
    url: PropTypes.string,
  })).isRequired,

  children: PropTypes.node.isRequired,
  sidebarItems: PropTypes.shape(PropTypes.string.isRequired).isRequired,

  submitMetadata: PropTypes.shape({
    disabled: PropTypes.bool,
    message: PropTypes.shape({
      id: PropTypes.string.isRequired,
      defaultMessage: PropTypes.string.isRequired,
    }).isRequired,
    onSubmit: PropTypes.func,
  }).isRequired,

  url: PropTypes.string.isRequired,
};

export default EditContentLayout;
