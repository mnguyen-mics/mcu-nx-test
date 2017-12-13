import React from 'react';
import PropTypes from 'prop-types';
import { Layout } from 'antd';

import { EditLayoutActionbar, SidebarWrapper } from '../Layout/index.ts';

function EditContentLayout({
  breadcrumbPaths,
  children,
  sidebarItems,
  buttonMetadata,
  url,
  isCreativetypePicker,
  changeType,
}) {

  return (
    <Layout className="edit-layout">
      <EditLayoutActionbar
        {...buttonMetadata}
        edition
        breadcrumbPaths={breadcrumbPaths}
        isCreativetypePicker={isCreativetypePicker}
      />

      <Layout>
        { sidebarItems && Object.keys(sidebarItems).length !== 0 ?
          <SidebarWrapper
            items={sidebarItems}
            scrollId={
              /* scrollId must be the same id as in the scrollable stuff
              * ex. at EmailForm: <Form id="emailForm" />
              */
              buttonMetadata.formId
            }
            url={url}
            changeType={changeType}
          />
        :
        null }
        <Layout>{children}</Layout>
      </Layout>
    </Layout>
  );
}

EditContentLayout.defaultProps = {
  sidebarItems: {},
  isCreativetypePicker: false,
  changeType: null,
};

EditContentLayout.propTypes = {
  breadcrumbPaths: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string,
    url: PropTypes.string,
  })).isRequired,

  children: PropTypes.node.isRequired,
  sidebarItems: PropTypes.shape(),

  buttonMetadata: PropTypes.shape({
    disabled: PropTypes.bool,
    message: PropTypes.shape({
      id: PropTypes.string.isRequired,
      defaultMessage: PropTypes.string.isRequired,
    }),
    onClick: PropTypes.func,
  }).isRequired,

  url: PropTypes.string.isRequired,
  isCreativetypePicker: PropTypes.bool,
  changeType: PropTypes.func,
};

export default EditContentLayout;
