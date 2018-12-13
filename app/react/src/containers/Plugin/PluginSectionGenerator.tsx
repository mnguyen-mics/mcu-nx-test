import * as React from 'react';
import { PluginLayoutSectionResource, PluginLayoutFieldResource } from '../../models/plugin/PluginLayout';
import { ButtonStyleless, McsIcon } from '../../components';
import { Row } from 'antd';
import { FormTitle } from '../../components/Form';
import withValidators from '../../components/Form/withValidators';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import injectDrawer from '../../components/Drawer/injectDrawer';
import { withRouter } from 'react-router';
import { PluginFieldGenerator } from '.';
import { compose } from 'recompose';
import messages from './Edit/messages';
import { PropertyResourceShape } from '../../models/plugin';

interface PluginSectionGeneratorProps {
    organisationId: string;
    pluginProperties: PropertyResourceShape[];
    pluginLayoutSection: PluginLayoutSectionResource;
    pluginVersionId: string;
    noUploadModal?: () => void;
    disableFields: boolean;
    small?: boolean;
}

type JoinedProps = PluginSectionGeneratorProps &
    InjectedIntlProps;

interface PluginSectionGeneratorState {
    displayAdvancedFields: boolean;
}

class PluginSectionGenerator extends React.Component<JoinedProps, PluginSectionGeneratorState> {

    constructor(props: JoinedProps) {
        super(props);

        this.state = {
            displayAdvancedFields: false,
        };
    }

    generateFormField = (field: PluginLayoutFieldResource) => {
        const {
            organisationId,
            pluginVersionId,
            pluginProperties,
            noUploadModal,
            disableFields,
            small
        } = this.props;

        const currentPluginProperty = pluginProperties.find(prop => prop.technical_name === field.property_technical_name);

        if (currentPluginProperty !== undefined) {
            return (
                <Row key={field.property_technical_name}>
                    <PluginFieldGenerator
                        definition={currentPluginProperty}
                        pluginLayoutFieldDefinition={field}
                        organisationId={organisationId}
                        pluginVersionId={pluginVersionId}
                        disabled={disableFields}
                        small={small}
                        {...noUploadModal}
                    />
                </Row>
            );
        }
        else {
            return null;
        }
    }

    toggleAdvancedFields = () => {
        const booleanAdvancedFields = this.state.displayAdvancedFields;

        this.setState({
            displayAdvancedFields: !booleanAdvancedFields,
        });
    }



    render() {
        const {
            intl: { formatMessage },
            pluginLayoutSection,
        } = this.props;

        const returnedFields = pluginLayoutSection.fields.map(this.generateFormField)
        const advancedFields = (pluginLayoutSection.advanced_fields !== null && pluginLayoutSection.advanced_fields.length !== 0) ?
            (
                <div>
                    <ButtonStyleless
                        className="optional-section-title"
                        onClick={this.toggleAdvancedFields}
                    >
                        <McsIcon type="settings" />
                        <span className="step-title">
                            {formatMessage(messages.advanced)}
                        </span>
                        <McsIcon type="chevron" />
                    </ButtonStyleless>

                    <div
                        className={!this.state.displayAdvancedFields
                            ? 'hide-section'
                            : 'optional-section-content'
                        }
                    >
                        {pluginLayoutSection.advanced_fields.map(this.generateFormField)}
                    </div>
                </div>
            ) :
            null;

        return (
            (returnedFields.length > 0 || advancedFields) &&
            <div id={pluginLayoutSection.title}>
                <Row type="flex" align="middle" justify="space-between" className="section-header">
                    <FormTitle
                        title={{ id: `section.${pluginLayoutSection.title}.title`, defaultMessage: pluginLayoutSection.title }}
                        subtitle={{ id: `section.${pluginLayoutSection.sub_title}.subTitle`, defaultMessage: pluginLayoutSection.sub_title }}
                    />
                </Row>
                {returnedFields}
                {advancedFields}
            </div>

        );
    }
}

export default compose<JoinedProps, PluginSectionGeneratorProps>(
    injectIntl,
    withRouter,
    injectDrawer,
    withValidators,
)(PluginSectionGenerator);