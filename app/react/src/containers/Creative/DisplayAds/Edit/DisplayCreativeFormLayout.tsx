import * as React from 'react';
import { compose } from 'recompose';
import { FormattedMessage, injectIntl, InjectedIntlProps } from 'react-intl';
import { Layout, Modal } from 'antd';
import { Form } from '@ant-design/compatible';
import { DISPLAY_CREATIVE_FORM } from './domain';
import messages from './messages';
import FormLayoutActionbar, {
  FormLayoutActionbarProps,
} from '../../../../components/Layout/FormLayoutActionbar';
import { BasicProps } from 'antd/lib/layout/layout';
import { McsFormSection } from '../../../../utils/FormHelper';

const Content = (Layout.Content as unknown) as React.ComponentClass<BasicProps & { id: string }>;

export interface DisplayCreativeFormLayoutProps {
  actionBarButtonText: FormattedMessage.MessageDescriptor;
  close: () => void;
  breadCrumbPaths: React.ReactNode[];
  leftFormSections: McsFormSection[];
  rightFormSections: McsFormSection[];
  pristine: boolean;
}

type Props = DisplayCreativeFormLayoutProps & InjectedIntlProps;

class DisplayCreativeFormLayout extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  onClose = () => {
    const { close, pristine, intl } = this.props;

    if (pristine) {
      close();
    } else {
      Modal.confirm({
        title: intl.formatMessage(messages.modalConfirmTitle),
        content: intl.formatMessage(messages.modalConfirmContent),
        okText: intl.formatMessage(messages.modalConfirmOk),
        cancelText: intl.formatMessage(messages.modalConfirmCancel),
        onOk: close,
      });
    }
  };

  generateLayout = () => {
    const { rightFormSections, leftFormSections } = this.props;

    const renderedRightSections = rightFormSections.map((section, index) => {
      return (
        <div key={section.id}>
          <div key={section.id} id={section.id}>
            {section.component}
          </div>
          {index !== rightFormSections.length - 1 && <hr />}
        </div>
      );
    });

    const renderedLeftSections = leftFormSections.map((section, index) => {
      const generateStyle = (id: string): React.CSSProperties => {
        switch (id) {
          case 'preview':
            return {
              flexGrow: 1,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'strech',
              flexDirection: 'column',
            };
          case 'loader':
            return { flexGrow: 1, overflowX: 'hidden' };
          case 'no-loader':
            return { flexGrow: 1, overflowX: 'hidden', display: 'flex' };
          default:
            return { flexGrow: 0 };
        }
      };

      return (
        <div key={section.id} id={section.id} style={generateStyle(section.id)}>
          {section.component}
        </div>
      );
    });

    return (
      <Layout className='ant-layout-has-sider'>
        <div
          className='ant-layout-sider'
          style={{ width: '53%', backgroundColor: 'rgba(0, 0, 0, 0.64)' }}
        >
          <div
            className='ant-layout-sider-children'
            style={{ display: 'flex', justifyContent: 'space-between', flexDirection: 'column' }}
          >
            {renderedLeftSections}
          </div>
        </div>
        <Layout>
          <Content
            id={DISPLAY_CREATIVE_FORM}
            className='mcs-content-container mcs-form-container'
            style={{ borderLeft: '1px rgba(0, 0, 0, 0.64) solid' }}
          >
            {renderedRightSections}
          </Content>
        </Layout>
      </Layout>
    );
  };

  render() {
    const { actionBarButtonText, breadCrumbPaths } = this.props;

    const actionBarProps: FormLayoutActionbarProps = {
      formId: DISPLAY_CREATIVE_FORM,
      pathItems: breadCrumbPaths,
      message: actionBarButtonText,
      onClose: this.onClose,
    };

    return (
      <Layout className='edit-layout'>
        <FormLayoutActionbar {...actionBarProps} />
        <Layout className={'ant-layout-has-sider'}>
          <Form className='edit-layout ant-layout' layout={'vertical'}>
            {/* this button enables submit on enter */}
            <button type='submit' style={{ display: 'none' }} />
            {this.generateLayout()}
          </Form>
        </Layout>
      </Layout>
    );
  }
}

export default compose<Props, DisplayCreativeFormLayoutProps>(injectIntl)(
  DisplayCreativeFormLayout,
);
