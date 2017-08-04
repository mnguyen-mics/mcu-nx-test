import React from 'react';
import PropTypes from 'prop-types';
import { Layout } from 'antd';

import SidebarWrapper from '../Partials/SidebarWrapper';
import ActionbarWrapper from '../Partials/ActionbarWrapper';


function EditContentLayout({
  breadcrumbPaths,
  children,
  scrollId,
  sidebarItems,
  submitMetadata,
  url
}) {

  return (
    <Layout>
      <ActionbarWrapper
        {...submitMetadata}
        breadcrumbPaths={breadcrumbPaths}
      />

      <Layout>
        <SidebarWrapper items={sidebarItems} scrollId={scrollId} url={url} />
        <Layout>{children}</Layout>
      </Layout>
    </Layout>
  );
}

EditContentLayout.propTypes = {
  breadcrumbPaths: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string.isRequired,
    url: PropTypes.string,
  })).isRequired,

  children: PropTypes.node.isRequired,
  /* scrollId must be the same id as in the scrollable stuff
   * ex. at EmailForm: <Form id="emailCampaignSteps" />
   */
  scrollId: PropTypes.string.isRequired,
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
