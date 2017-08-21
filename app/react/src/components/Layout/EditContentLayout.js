import React from 'react';
import PropTypes from 'prop-types';
import { Layout } from 'antd';

import { ActionbarWrapper, SidebarWrapper } from '../Layout';

function EditContentLayout({
  breadcrumbPaths,
  children,
  sidebarItems,
  buttonMetadata,
  url,
}) {

  return (
    <Layout>
      <ActionbarWrapper
        {...buttonMetadata}
        breadcrumbPaths={breadcrumbPaths}
      />

      <Layout>
        <SidebarWrapper
          items={sidebarItems}
          scrollId={
            /* scrollId must be the same id as in the scrollable stuff
             * ex. at EmailForm: <Form id="emailForm" />
             */
            buttonMetadata.formId
          }
          url={url}
        />
        <Layout>{children}</Layout>
      </Layout>
    </Layout>
  );
}

EditContentLayout.propTypes = {
  breadcrumbPaths: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string,
    url: PropTypes.string,
  })).isRequired,

  children: PropTypes.node.isRequired,
  sidebarItems: PropTypes.shape().isRequired,

  buttonMetadata: PropTypes.shape({
    disabled: PropTypes.bool,
    message: PropTypes.shape({
      id: PropTypes.string.isRequired,
      defaultMessage: PropTypes.string.isRequired,
    }).isRequired,
    onClick: PropTypes.func,
  }).isRequired,

  url: PropTypes.string.isRequired,
};

export default EditContentLayout;
