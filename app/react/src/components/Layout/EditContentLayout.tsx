import * as React from 'react';
import { Layout } from 'antd';
import { FormattedMessage } from 'react-intl';
import { Path } from '../ActionBar';
import EditLayoutActionbar from './EditLayoutActionbar';
import SidebarWrapper from './SidebarWrapper';

const EditLayoutActionbarJS = EditLayoutActionbar as any;

export interface EditContentLayoutProps {
  breadcrumbPaths: Path[];
  sidebarItems?: { [key: string]: FormattedMessage.MessageDescriptor };
  buttonMetadata: {
    message?: FormattedMessage.MessageDescriptor,
    formId: string,
    onClose: () => void,
  };
  url: string;
}

class EditContentLayout extends React.Component<EditContentLayoutProps> {

  render() {
    const {
      breadcrumbPaths,
      children,
      sidebarItems,
      buttonMetadata,
      url,
    } = this.props;

    const eventualSidebar = sidebarItems && (
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
    );

    return (
      <Layout className="edit-layout">
        <EditLayoutActionbarJS
          {...buttonMetadata}
          edition={true}
          breadcrumbPaths={breadcrumbPaths}
        />

        <Layout>
          {eventualSidebar}
          <Layout>{children}</Layout>
        </Layout>
      </Layout>
    );
  }
}

export default EditContentLayout;
