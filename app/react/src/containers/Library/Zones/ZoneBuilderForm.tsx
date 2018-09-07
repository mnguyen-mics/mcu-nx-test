import * as React from 'react';
import { Layout, Button } from 'antd';
import { FormLayoutActionbar } from '../../../components/Layout';
import { FormLayoutActionbarProps } from '../../../components/Layout/FormLayoutActionbar';
import MapboxGLMap from './Sections/Map';
import { Form, ConfigProps, InjectedFormProps, reduxForm } from 'redux-form';
import { Omit } from '../../../utils/Types';
import { ZoneBuilderFormData } from './domain';
import { Path } from '../../../components/ActionBar';
import { compose } from 'recompose';
import GeneralFormSection from './Sections/GeneralFormSection';
import BlurredModal from '../../../components/BlurredModal/BlurredModal';
import messages from './messages';
import { McsIcon } from '../../../components';
import { FormattedMessage } from 'react-intl';
import { ButtonProps } from 'antd/lib/button';



const { Content } = Layout;


const FORM_ID = 'zoneBuilder'

export interface ZoneBuilderProps extends Omit<ConfigProps<ZoneBuilderFormData>, 'form'> {
  onClose: () => void;
  onSave: (formData: ZoneBuilderFormData) => void;
  breadCrumbPaths: Path[];
  showStep2?: boolean;
  onDrawChange: (data: GeoJSON.FeatureCollection) => void;
  onStep2Abort: () => void;
}

type Props = ZoneBuilderProps & InjectedFormProps<ZoneBuilderFormData, ZoneBuilderProps>;



class ZoneBuilderForm extends React.Component<Props> {


  render() {

    const {
      handleSubmit,
      breadCrumbPaths,
      onClose,
      onSave,
      showStep2,
      onStep2Abort,
      onDrawChange
    } = this.props;

    const actionBarProps: FormLayoutActionbarProps = {
      formId: FORM_ID,
      paths: breadCrumbPaths,
      message: messages.saveZone,
      onClose: onClose
    };

    const submitButtonProps: ButtonProps = {
      htmlType: 'submit',
      type: 'primary',
      onClick: handleSubmit(onSave)
    };

    const modalFooter = (
      <Button {...submitButtonProps} className="mcs-primary">
        <McsIcon type="plus" />
        <FormattedMessage {...messages.saveZone} />
      </Button>
    )

    return (
      <Layout className="edit-layout">
        <FormLayoutActionbar {...actionBarProps} />
        <Layout className={'ant-layout-has-sider'}>
          <Form
            onSubmit={handleSubmit(onSave) as any}
            className="edit-layout ant-layout"
          >
            <Content
              className="mcs-content-container mcs-form-container"
              style={{ padding: 0, overflow: 'hidden', position: 'relative' }}
            >
              <MapboxGLMap
                onDraw={onDrawChange}
              />
            </Content>
            <BlurredModal
              onClose={onStep2Abort}
              formId={FORM_ID}
              opened={showStep2}
              footer={modalFooter}
            >
              <GeneralFormSection />
            </BlurredModal>
              

          </Form>
        </Layout>
      </Layout>
    );
  }
}

export default compose<Props, ZoneBuilderProps>(
  reduxForm<ZoneBuilderFormData, ZoneBuilderProps>({
    form: FORM_ID,
    enableReinitialize: true,
  }),
)(ZoneBuilderForm);
