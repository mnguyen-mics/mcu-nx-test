import * as React from 'react';
import { Form, reduxForm, InjectedFormProps, ConfigProps } from 'redux-form';
import { compose } from 'recompose';
import { Layout } from 'antd';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { Path } from '@mediarithmics-private/mcs-components-library/lib/components/action-bar/Actionbar';
import FormLayoutActionbar, {
  FormLayoutActionbarProps,
} from '../../../../../components/Layout/FormLayoutActionbar';
import ScrollspySider, {
  SidebarWrapperProps,
} from '../../../../../components/Layout/ScrollspySider';
import messages from '../List/messages';
import { DatamartReplicationFormData } from './domain';
import { Omit } from '../../../../../utils/Types';
import GeneralFormSection from './Sections/GeneralFormSection';
import { McsFormSection } from '../../../../../utils/FormHelper';
import PubSubCustomFormSection from './Sections/PubSubCustomFormSection';
import EventHubsCustomFormSection from './Sections/EventHubsCustomFormSection';

const Content = Layout.Content;

export interface DatamartReplicationEditFormProps
  extends Omit<ConfigProps<DatamartReplicationFormData>, 'form'> {
  close: () => void;
  breadCrumbPaths: Path[];
  type: string;
}

type Props = InjectedFormProps<
  DatamartReplicationFormData,
  DatamartReplicationEditFormProps
> &
  DatamartReplicationEditFormProps &
  InjectedIntlProps;

export const FORM_ID = 'datamartReplicationForm';

class DatamartReplicationEditForm extends React.Component<Props> {
  render() {
    const { handleSubmit, breadCrumbPaths, close, type } = this.props;

    const actionBarProps: FormLayoutActionbarProps = {
      formId: FORM_ID,
      paths: breadCrumbPaths,
      message: messages.saveDatamartReplication,
      onClose: close,
    };

    const sections: McsFormSection[] = [];
    sections.push({
      id: 'general',
      title: messages.sectionGeneralTitle,
      component: <GeneralFormSection />,
    });

    if (type === 'GOOGLE_PUBSUB') {
      sections.push({
        id: 'custom',
        title: messages.sectionCustomTitle,
        component: <PubSubCustomFormSection />,
      });
    }

    if (type === 'AZURE_EVENT_HUBS') {
      sections.push({
        id: 'custom',
        title: messages.sectionCustomTitle,
        component: <EventHubsCustomFormSection />,
      });
    }

    const sideBarProps: SidebarWrapperProps = {
      items: sections.map(s => ({ sectionId: s.id, title: s.title })),
      scrollId: FORM_ID,
    };

    const renderedSections = sections.map((section, index) => {
      return (
        <div key={section.id}>
          <div key={section.id} id={section.id}>
            {section.component}
          </div>
          {index !== sections.length - 1 && <hr />}
        </div>
      );
    });

    return (
      <Layout className="edit-layout">
        <FormLayoutActionbar {...actionBarProps} />
        <Layout className={'ant-layout-has-sider'}>
          <ScrollspySider {...sideBarProps} />
          <Form
            className="edit-layout ant-layout"
            onSubmit={handleSubmit as any}
          >
            {/* this button enables submit on enter */}
            <button type="submit" style={{ display: 'none' }} />
            <Content
              id={FORM_ID}
              className="mcs-content-container mcs-form-container"
            >
              {renderedSections}
            </Content>
          </Form>
        </Layout>
      </Layout>
    );
  }
}

export default compose<Props, DatamartReplicationEditFormProps>(
  injectIntl,
  reduxForm({
    form: FORM_ID,
    enableReinitialize: true,
  }),
)(DatamartReplicationEditForm);
