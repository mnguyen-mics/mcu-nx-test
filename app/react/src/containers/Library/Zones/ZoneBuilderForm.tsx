import * as React from 'react';
import { Layout } from 'antd';
import { FormLayoutActionbar } from '../../../components/Layout';
import { FormLayoutActionbarProps } from '../../../components/Layout/FormLayoutActionbar';
import { defineMessages } from 'react-intl';
import MapboxGLMap from './Sections/Map';
import { Form, ConfigProps, InjectedFormProps, reduxForm } from 'redux-form';
import { Omit } from '../../../utils/Types';
import { ZoneBuilderFormData } from './domain';
import { Path } from '../../../components/ActionBar';
import { compose } from 'recompose';
import GeneralFormSection from './Sections/GeneralFormSection';
import FullScreenModal from '../../../components/BlurredModal/FullScreenFormModal'



const { Content } = Layout;

const messages = defineMessages({
  saveZone: {
    id: 'library.edit.zone.save',
    defaultMessage: 'Save Zone'
  }
})

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
            <FullScreenModal
              opened={showStep2}
            >
              <GeneralFormSection
                onClose={onStep2Abort}
                formId={FORM_ID}
              />
            </FullScreenModal>
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
