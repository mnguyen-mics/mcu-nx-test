import * as React from 'react';
import { Layout } from 'antd';
import { Form, FieldArray, GenericFieldArray, Field, reduxForm, InjectedFormProps } from 'redux-form';
import { RouteComponentProps } from 'react-router';
import { InjectedIntlProps } from 'react-intl';
import { compose } from 'recompose';
import { BasicProps } from 'antd/lib/layout/layout';
import { DrawableContentProps } from '../../../../../../components/Drawer';
import CampaignsInfos, { CampaignsInfosProps } from './CampaignsInfos';
import FormLayoutActionbar, {
  FormLayoutActionbarProps,
} from '../../../../../../components/Layout/FormLayoutActionBar';
import messages from '../../messages';

const FORM_ID = 'editCampaignsForm';

const CampaignsInfosFieldArray = FieldArray as new() => GenericFieldArray<Field, CampaignsInfosProps>;


export interface EditCampaignsFormProps extends DrawableContentProps {
	save: (formdata: any) => void; // type later
  close: () => void;
  RxF: InjectedFormProps;
}

type JoinedProps = EditCampaignsFormProps &
InjectedIntlProps &
RouteComponentProps<{ organisationId: string }>

const Content = Layout.Content as React.ComponentClass<
  BasicProps & { id: string }
>;

class EditCampaignsForm extends React.Component<JoinedProps, {}> {

  constructor(props: JoinedProps) {
    super(props);
    this.state = {
      
    };
  }
  render() {

    const {
      save,
      RxF: { handleSubmit }
    } = this.props;

    const actionBarProps: FormLayoutActionbarProps = {
      formId: FORM_ID,
      paths: [{
        name: messages.editCampaigns,
      }],
      message: messages.saveCampaigns,
      onClose: this.props.closeNextDrawer,
    };

    return (
      <Layout className="edit-layout">
        <FormLayoutActionbar {...actionBarProps} />
        <Layout className={'ant-layout-has-sider'}>
          <Form
            className="edit-layout ant-layout"
            onSubmit={handleSubmit(save)}
          >
            <Content
              id={FORM_ID}
              className="mcs-content-container mcs-form-container"
            >
							<CampaignsInfosFieldArray
                name="campaignInfos"
                component={CampaignsInfos}
              />
						</Content>
          </Form>
        </Layout>
      </Layout>
    );
  }
}

export default compose<JoinedProps, EditCampaignsFormProps>(
  reduxForm({
    form: FORM_ID,
    enableReinitialize: true,
    propNamespace: 'RxF',
  }),
)(EditCampaignsForm);
