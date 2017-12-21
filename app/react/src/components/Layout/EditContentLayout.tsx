import * as React from 'react';
import { Layout } from 'antd';

import { EditLayoutActionbar, SidebarWrapper } from './index';

interface MessageProps {
  id: string;
  defaultMessage: string;
}

interface EditContentLayoutProps {
  breadcrumbPaths: Array<{
    name: string,
    url?: string,
  }>;
  children: React.ReactNode;
  sidebarItems?: {
    [key: string]: MessageProps;
  };
  buttonMetadata: {
    disabled?: boolean;
    formId: string;
    message?: MessageProps;
    onClose?: () => void; // check type
    onClick?: () => void; // check type
    submitting?: boolean;
  };
  url: string;
  isCreativetypePicker?: boolean;
  changeType?: () => void; // check type
}

const EditContentLayout: React.SFC<EditContentLayoutProps> = props => {
  return (
    <Layout className="edit-layout">
      <EditLayoutActionbar
        {...props.buttonMetadata}
        breadcrumbPaths={props.breadcrumbPaths}
        isCreativetypePicker={props.isCreativetypePicker}
      />

      <Layout>
        { props.sidebarItems && Object.keys(props.sidebarItems).length !== 0 ?
          <SidebarWrapper
            items={props.sidebarItems}
            scrollId={
              /* scrollId must be the same id as in the scrollable stuff
              * ex. at EmailForm: <Form id="emailForm" />
              */
              props.buttonMetadata.formId
            }
            url={props.url}
            changeType={props.changeType}
          />
        :
        null }
        <Layout>{props.children}</Layout>
      </Layout>
    </Layout>
  );
};

EditContentLayout.defaultProps = {
  sidebarItems: {},
  isCreativetypePicker: false,
  changeType: undefined,
};

export default EditContentLayout;
