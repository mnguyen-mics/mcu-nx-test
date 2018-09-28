import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import { compose } from 'recompose';
import { OfferType } from './CreateOfferPage';
import { Layout } from 'antd';
import { FormLayoutActionbar, ScrollspySider } from '../../../../components/Layout';
import { Form, InjectedFormProps, reduxForm, ConfigProps } from 'redux-form';
import { BasicProps } from 'antd/lib/layout/layout';
import { FormLayoutActionbarProps } from '../../../../components/Layout/FormLayoutActionbar';
import messages from '../../messages';
import { SidebarWrapperProps } from '../../../../components/Layout/ScrollspySider';
import { McsFormSection } from '../../../../utils/FormHelper';
import { Path } from '../../../../components/ActionBar';
import { Omit } from '../../../../utils/Types';
import { OfferFormData } from '../domain';
import { FormSection, FormInputField, FormInput, FormSelectField, DefaultSelect } from '../../../../components/Form';
import withValidators, { ValidatorProps } from '../../../../components/Form/withValidators';

const Content = Layout.Content as React.ComponentClass<
    BasicProps & { id: string }
    >;

interface State {
    loading: boolean;
}

export interface OfferFormProps extends Omit<ConfigProps<OfferFormData>, 'form'> {
    close: () => void;
    breadCrumbPaths: Path[];
    offerType: OfferType;
}



type Props = InjectedFormProps<OfferFormData, OfferFormProps> &
    RouteComponentProps<{ organisationId: string }> &
    OfferFormProps &
    ValidatorProps &
    InjectedIntlProps;

export const FORM_ID = 'offerForm';

class CreateOfferForm extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);

        this.state = {
            loading: false,
        };
    }

    render() {
        const {
            handleSubmit,
            breadCrumbPaths,
            offerType,
            close,
            fieldValidators: { isRequired },
            intl: { formatMessage },
        } = this.props;

        const actionBarProps: FormLayoutActionbarProps = {
            formId: FORM_ID,
            paths: breadCrumbPaths,
            message: messages.saveOffer,
            onClose: close,
        };

        const sections: McsFormSection[] = [];
        sections.push({
            id: 'general',
            title: messages.generalInformation,
            component: (
                <div>
                    <FormSection
                        subtitle={messages.sectionNewOfferSubtitle}
                        title={messages.sectionNewOfferTitle}
                    />

                    <div>
                        <FormInputField
                            name="name"
                            component={FormInput}
                            validate={[isRequired]}
                            formItemProps={{
                                label: formatMessage(messages.sectionNewOfferNameLabel),
                                required: true,
                            }}
                            inputProps={{
                                placeholder: formatMessage(
                                    messages.sectionNewOfferNamePlaceholder,
                                ),
                            }}
                        />
                    </div>
                </div>
            ),
        });
        if (offerType === OfferType.Automatic) {

            const optionsAutomaticOn = [
                {
                    value: "AUDIENCE_SEGMENT",
                    title: "AUDIENCE_SEGMENT",
                },
                {
                    value: "DEAL_LIST",
                    title: "DEAL_LIST",
                },
                {
                    value: "PLACEMENT_LIST",
                    title: "PLACEMENT_LIST",
                },
                {
                    value: "KEYWORDS_LIST",
                    title: "KEYWORDS_LIST",
                }
            ];

            sections.push({
                id: 'automaticOn',
                title: messages.automaticOn,
                component: (
                    <div>
                        <FormSection
                            subtitle={messages.sectionServiceTypeSubtitle}
                            title={messages.sectionServiceTypeTitle}
                        />

                        <div>
                            <FormSelectField
                                name="automatic_on"
                                component={DefaultSelect}
                                validate={[isRequired]}
                                formItemProps={{
                                    label: formatMessage(
                                        messages.sectionNewOfferAutomaticOnLabel,
                                    ),
                                }}
                                options={optionsAutomaticOn}
                            />
                        </div>
                    </div>
                ),
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

export default compose<Props, OfferFormProps>(
    injectIntl,
    withValidators,
    withRouter,
    reduxForm({
        form: FORM_ID,
        enableReinitialize: true,
    }),
)(CreateOfferForm);