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
  isCreativetypePicker?: boolean;
  changeType?: () => void; // check type
}

class EditContentLayout extends React.Component<EditContentLayoutProps> {

  render() {
    const {
      breadcrumbPaths,
      children,
      sidebarItems,
      buttonMetadata,
      url,
      changeType,
      isCreativetypePicker,
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
        changeType={changeType}
      />
    );

    return (
      <Layout className="edit-layout">
        <EditLayoutActionbarJS
          {...buttonMetadata}
          edition={true}
          breadcrumbPaths={breadcrumbPaths}
          isCreativetypePicker={isCreativetypePicker}
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
