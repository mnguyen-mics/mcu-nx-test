import * as React from 'react';
import { injectIntl, FormattedMessage, InjectedIntlProps } from 'react-intl';
import { Layout, Row } from 'antd';
import { RouteComponentProps, withRouter } from 'react-router';
import { FormTitle } from '../../../../components/Form';
import {
  MenuList,
  MenuPresentational,
  MenuSubList,
} from '../../../../components/FormMenu';
import messages from './messages';
import FormLayoutActionbar, {
  FormLayoutActionbarProps,
} from '../../../../components/Layout/FormLayoutActionbar';
import PluginService from '../../../../services/PluginService';
import { Submenu } from '../../../../components/FormMenu/MenuSubList';
import { MicsPLuginDefinition } from './domain';

const { Content } = Layout;

const imageAdRendererId = MicsPLuginDefinition.imageAdRendererId.id;
const htmlAdRendererId = MicsPLuginDefinition.htmlAdRendererId.id;
const externalAdRendererId = MicsPLuginDefinition.externalAdRendererId.id;
// const nativeIvidenceAdRendererId = MicsPLuginDefinition.nativeIvidenceAdRendererId.id;
// const nativeQuantumAdRendererId = MicsPLuginDefinition.nativeQuantumAdRendererId.id;
const imageSkinsAdRendererId = MicsPLuginDefinition.imageSkinsAdRendererId.id;

export interface DisplayCreativeRendererSelectorProps {
  onSelect: (adRendererId: string) => void;
  close: () => void;
}

interface State {
  adRendererSubmenu: Submenu[];
}

type Props = DisplayCreativeRendererSelectorProps &
  InjectedIntlProps &
  RouteComponentProps<{ organisationId: string }>;

class DisplayCreativeRendererSelector extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      adRendererSubmenu: [],
    };
  }

  renderAdRendererSubmenu = () => {
    const { onSelect } = this.props;
    const previousAdRendererIds = [
      imageAdRendererId,
      htmlAdRendererId,
      externalAdRendererId,
      imageSkinsAdRendererId,
    ];
    const adRendererSubmenu: Submenu[] = [];
    PluginService.getPlugins({
      max_results: 1000,
      plugin_type: 'DISPLAY_AD_RENDERER',
    })
      .then(resp => resp.data)
      .then(adRendererList => {
        adRendererList
          .filter(ad => !previousAdRendererIds.includes(ad.id))
          .forEach(adRenderer => {
            const separators = ['_', '-'];
            const formattedName = adRenderer.artifact_id
              .split(new RegExp(separators.join('|'), 'g'))
              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ');
            return adRendererSubmenu.push({
              title: formattedName,
              select: () => onSelect(adRenderer.id),
            });
          });
      });
    return adRendererSubmenu;
  };

  render() {
    const {
      onSelect,
      intl: { formatMessage },
    } = this.props;

    const onTypeSelect = (adRendererId: string) => () => {
      onSelect(adRendererId);
    };

    const actionBarProps: FormLayoutActionbarProps = {
      formId: 'typePickerForm',
      onClose: this.props.close,
      paths: [
        {
          name: messages.creativeCreationBreadCrumb,
        },
      ],
    };

    return (
      <Layout>
        <div className="edit-layout ant-layout">
          <FormLayoutActionbar {...actionBarProps} />
          <Layout>
            <Content className="mcs-content-container mcs-form-container text-center">
              <FormTitle
                title={messages.creativesTypePickerTitle}
                subtitle={messages.creativesTypePickerSubTitle}
              />

              <Row style={{ width: '650px', display: 'inline-block' }}>
                <Row className="menu">
                  <div className="presentation">
                    <MenuPresentational
                      title={formatMessage(messages.creativeTypeImage)}
                      type="image"
                      select={onTypeSelect(imageAdRendererId)}
                    />
                    <div className="separator">
                      <FormattedMessage {...messages.creativeTypeOr} />
                    </div>
                    <MenuPresentational
                      title={formatMessage(messages.creativeTypeHtml)}
                      type="code"
                      select={onTypeSelect(htmlAdRendererId)}
                    />
                  </div>
                </Row>
                <Row className="intermediate-title">
                  <FormattedMessage {...messages.creativeTypeAdvanced} />
                </Row>
                <Row className="menu">
                  <MenuList
                    title={formatMessage(messages.creativeTypeAgency)}
                    select={onTypeSelect(externalAdRendererId)}
                  />
                  <MenuList
                    title={formatMessage(messages.creativeTypeSkin)}
                    select={onTypeSelect(imageSkinsAdRendererId)}
                  />
                  <MenuSubList
                    title={formatMessage(messages.allRendererList)}
                    subtitles={[
                      formatMessage(messages.allRendererListSubtitle),
                    ]}
                    submenu={this.renderAdRendererSubmenu()}
                  />
                </Row>
              </Row>
            </Content>
          </Layout>
        </div>
      </Layout>
    );
  }
}

export default withRouter(injectIntl(DisplayCreativeRendererSelector));
