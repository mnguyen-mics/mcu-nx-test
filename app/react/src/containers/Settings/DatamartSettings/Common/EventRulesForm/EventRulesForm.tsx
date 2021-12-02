import * as React from 'react';
import { Form, reduxForm, InjectedFormProps, ConfigProps } from 'redux-form';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { Layout } from 'antd';
import { withRouter, RouteComponentProps } from 'react-router';
import { BasicProps } from 'antd/lib/layout/layout';
import { injectIntl, InjectedIntlProps, defineMessages } from 'react-intl';
import FormLayoutActionbar, {
  FormLayoutActionbarProps,
} from '../../../../../components/Layout/FormLayoutActionbar';
import { EventRulesFormData } from '../domain';
import { Omit } from '../../../../../utils/Types';
import CatalogAutoMatch from './Sections/CatalogAutoMatch';
import UserIdentifierinsertion from './Sections/UserIdentifierInsertion';
import UriMatch from './Sections/UriMatch';
import PropertyToOriginCopy from './Sections/PropertyToOriginCopy';
import * as SessionSelectors from '../../../../../redux/Session/selectors';
import { IDatamartService } from '../../../../../services/DatamartService';
import { UserAccountCompartmentDatamartSelectionResource } from '../../../../../models/datamart/DatamartResource';
import { MicsReduxState } from '../../../../../utils/ReduxHelper';
import { TYPES } from '../../../../../constants/types';
import { lazyInject } from '../../../../../config/inversify.config';

const messages = defineMessages({
  saveEventRules: {
    id: 'settings.form.eventRules.save',
    defaultMessage: 'Save',
  },
  error: {
    id: 'settings.form.eventRules.errorType',
    defaultMessage: 'Please specify a known type',
  },
});

const Content = Layout.Content as unknown as React.ComponentClass<BasicProps & { id: string }>;

export interface EventRulesFormProps extends Omit<ConfigProps<EventRulesFormData>, 'form'> {
  close: () => void;
  breadCrumbPaths: React.ReactNode[];
  datamartId: string;
}

interface MapStateToProps {
  hasDatamarts: (organisationId: string) => boolean;
}

type Props = InjectedFormProps<EventRulesFormData, EventRulesFormProps> &
  EventRulesFormProps &
  MapStateToProps &
  InjectedIntlProps &
  RouteComponentProps<{ organisationId: string }>;

export const FORM_ID = 'eventRulesForm';

interface State {
  compartments: UserAccountCompartmentDatamartSelectionResource[];
}

class EventRulesForm extends React.Component<Props, State> {
  @lazyInject(TYPES.IDatamartService)
  private _datamartService: IDatamartService;

  constructor(props: Props) {
    super(props);
    this.state = { compartments: [] };
  }

  componentDidMount() {
    this._datamartService
      .getUserAccountCompartmentDatamartSelectionResources(this.props.datamartId)
      .then(res => {
        this.setState({ compartments: res.data });
      });
  }

  render() {
    const { handleSubmit, breadCrumbPaths, close, initialValues, intl } = this.props;

    const actionBarProps: FormLayoutActionbarProps = {
      formId: FORM_ID,
      pathItems: breadCrumbPaths,
      message: messages.saveEventRules,
      onClose: close,
    };

    const renderConditionnaly = () => {
      if (initialValues.model) {
        switch (initialValues.model.type) {
          case 'CATALOG_AUTO_MATCH':
            return <CatalogAutoMatch />;
          case 'PROPERTY_TO_ORIGIN_COPY':
            return <PropertyToOriginCopy />;
          case 'URL_MATCH':
            return <UriMatch />;
          case 'USER_IDENTIFIER_INSERTION':
            return <UserIdentifierinsertion datamartId={this.props.datamartId} />;
        }
      }
      return <div>{intl.formatMessage(messages.error)}</div>;
    };

    return (
      <Layout className='edit-layout'>
        <FormLayoutActionbar {...actionBarProps} />
        <Layout className={'ant-layout-has-sider'}>
          <Form className='edit-layout ant-layout' onSubmit={handleSubmit as any}>
            <Content id={FORM_ID} className='mcs-content-container mcs-form-container'>
              {renderConditionnaly()}
            </Content>
          </Form>
        </Layout>
      </Layout>
    );
  }
}

export default compose<Props, EventRulesFormProps>(
  injectIntl,
  withRouter,
  reduxForm({
    form: FORM_ID,
    enableReinitialize: true,
  }),
  connect((state: MicsReduxState) => ({ hasDatamarts: SessionSelectors.hasDatamarts(state) })),
)(EventRulesForm);
