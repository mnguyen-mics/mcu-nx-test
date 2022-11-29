import * as React from 'react';
import { Layout } from 'antd';
import FormLayoutActionbar, { FormLayoutActionbarProps } from './FormLayoutActionbar';
import ScrollspySider, { SideBarItem } from './ScrollspySider';

export interface EditContentLayoutProps extends FormLayoutActionbarProps {
  scrollId?: string;
  items?: SideBarItem[];
}

class EditContentLayout extends React.Component<EditContentLayoutProps> {
  render() {
    const { scrollId, items, children, ...rest } = this.props;

    const eventualSidebar = items && items.length && (
      <ScrollspySider items={items} scrollId={scrollId || rest.formId} />
    );

    return (
      <Layout className='edit-layout'>
        <FormLayoutActionbar {...rest} />

        <Layout>
          {eventualSidebar}
          <Layout>{children}</Layout>
        </Layout>
      </Layout>
    );
  }
}

export default EditContentLayout;
