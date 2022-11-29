import * as React from 'react';
import {
  lazyInject,
  TYPES,
  IIdentityProviderService,
  injectWorkspace,
  IdentityProviderResource,
} from '@mediarithmics-private/advanced-components';
import { defineMessages, WrappedComponentProps, injectIntl } from 'react-intl';
import { compose } from 'recompose';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../Notifications/injectNotifications';
import { InjectedWorkspaceProps } from '../../../Datamart';
import { Button, Form, Input, Select } from 'antd';
import FormSection from '../../../../components/Form/FormSection';
import { IdentityProviderType } from '@mediarithmics-private/advanced-components/lib/models/identityProvider/IdentityProviderResource';
import { CopyToClipboard, Loading } from '@mediarithmics-private/mcs-components-library';
import { Subject } from 'rxjs';

const { Option } = Select;

interface FormValues {
  name: string;
  description?: string;
  provider_type: IdentityProviderType;
  metadata_xml_url: string;
  redirect_url?: string;
  entity_id: string;
}

export interface IdentityProviderFormProps {
  identityProviderId?: string;
  newIdentityProviderSubject?: Subject<IdentityProviderResource>;
}

type Props = IdentityProviderFormProps &
  InjectedNotificationProps &
  WrappedComponentProps &
  InjectedWorkspaceProps;

interface State {
  identityProvider?: IdentityProviderResource;
}

class IdentityProviderForm extends React.Component<Props, State> {
  @lazyInject(TYPES.IIdentityProviderService)
  private _identityProviderService: IIdentityProviderService;

  constructor(props: Props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    const { identityProviderId } = this.props;
    identityProviderId && this.fetchIdentityProvider(identityProviderId);
  }

  fetchIdentityProvider = (identityProviderId: string) => {
    const {
      notifyError,
      workspace: { community_id },
    } = this.props;

    this._identityProviderService
      .getCommunityIdentityProvider(community_id, identityProviderId)
      .then(({ data: identityProvider }) => this.setState({ identityProvider }))
      .catch(error => notifyError(error));
  };

  onFinish = (formValues: FormValues) => {
    const {
      newIdentityProviderSubject,
      notifyError,
      workspace: { community_id },
      identityProviderId,
    } = this.props;

    const promise = !identityProviderId
      ? this._identityProviderService.createIdentityProvider(community_id, formValues)
      : this._identityProviderService.updateIdentityProvider(
          community_id,
          identityProviderId,
          formValues,
        );

    promise
      .then(({ data: identityProvider }) => {
        newIdentityProviderSubject?.next(identityProvider);
      })
      .catch(error => {
        notifyError(error);
      });
  };

  render() {
    const {
      intl: { formatMessage },
      identityProviderId,
    } = this.props;
    const { identityProvider } = this.state;

    if (identityProviderId && !identityProvider) {
      return <Loading isFullScreen={false} />;
    }

    const initialValues: Partial<FormValues> = identityProvider
      ? {
          ...identityProvider,
        }
      : { provider_type: 'SAML_V2_0' };

    return (
      <Form
        className='mcs-identityProviderForm'
        layout='vertical'
        onFinish={this.onFinish}
        initialValues={initialValues}
      >
        <div>
          <FormSection title={messages.generalSectionTitle} />
          <Form.Item
            name='name'
            label={formatMessage(messages.nameLabel)}
            rules={[{ required: true }]}
          >
            <Input
              placeholder={formatMessage(messages.namePlaceholder)}
              disabled={!!identityProviderId}
            />
          </Form.Item>
          <Form.Item name='description' label={formatMessage(messages.descriptionLabel)}>
            <Input placeholder={formatMessage(messages.descriptionPlaceholder)} />
          </Form.Item>
          <Form.Item
            name='provider_type'
            label={formatMessage(messages.typeLabel)}
            rules={[{ required: true }]}
          >
            <Select value='SAML_V2_0' disabled={!!identityProviderId}>
              <Option value={'SAML_V2_0'}>SAML_V2_0</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name='metadata_xml_url'
            label={formatMessage(messages.metadataXmlUrlLabel)}
            rules={[{ required: true }, { type: 'url' }]}
          >
            <Input type='url' placeholder={formatMessage(messages.metadataXmlUrlPlaceholder)} />
          </Form.Item>
        </div>
        {identityProvider && (
          <div>
            <FormSection title={messages.technicalSectionTitle} />
            <Form.Item name='entity_id' label={formatMessage(messages.entityIDLabel)}>
              <Input
                disabled
                value={identityProvider.entity_id}
                addonAfter={<CopyToClipboard value={identityProvider.entity_id} />}
              />
            </Form.Item>
            {identityProvider.redirect_url && (
              <Form.Item name='redirect_url' label={formatMessage(messages.redirectURILabel)}>
                <Input
                  disabled
                  value={identityProvider.redirect_url}
                  addonAfter={<CopyToClipboard value={identityProvider.redirect_url} />}
                />
              </Form.Item>
            )}
          </div>
        )}
        <div className='mcs-identityProviderForm_submit_container'>
          <Button type='primary' htmlType='submit' className='mcs-primary'>
            {formatMessage(messages.save)}
          </Button>
        </div>
      </Form>
    );
  }
}

export default compose<Props, IdentityProviderFormProps>(
  injectIntl,
  injectWorkspace,
  injectNotifications,
)(IdentityProviderForm);

const messages = defineMessages({
  generalSectionTitle: {
    id: 'identityProviderForm.section.general.title',
    defaultMessage: 'General Information',
  },
  nameLabel: {
    id: 'identityProviderForm.label.name',
    defaultMessage: 'Name',
  },
  namePlaceholder: {
    id: 'identityProviderForm.placeholder.name',
    defaultMessage: 'Name',
  },
  descriptionLabel: {
    id: 'identityProviderForm.label.description',
    defaultMessage: 'Description',
  },
  descriptionPlaceholder: {
    id: 'identityProviderForm.placeholder.description',
    defaultMessage: 'Description',
  },
  typeLabel: {
    id: 'identityProviderForm.label.type',
    defaultMessage: 'Type',
  },
  metadataXmlUrlLabel: {
    id: 'identityProviderForm.label.metadataXmlUrl',
    defaultMessage: 'Import metadata.xml',
  },
  metadataXmlUrlPlaceholder: {
    id: 'identityProviderForm.placeholder.metadataXmlUrl',
    defaultMessage: 'metadata.xml URL',
  },
  technicalSectionTitle: {
    id: 'identityProviderForm.section.technical.title',
    defaultMessage: 'Technical Information',
  },
  entityIDLabel: {
    id: 'identityProviderForm.label.entityID',
    defaultMessage: 'Identifier (Entity ID)',
  },
  redirectURILabel: {
    id: 'identityProviderForm.label.redirectURI',
    defaultMessage: 'Redirect URI/Reply URL',
  },
  save: {
    id: 'identityProviderForm.save',
    defaultMessage: 'Save',
  },
});
