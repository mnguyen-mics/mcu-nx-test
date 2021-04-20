import * as React from 'react';
import { injectIntl, FormattedMessage, InjectedIntlProps } from 'react-intl';
import { Layout, Row } from 'antd';
import { RouteComponentProps, withRouter } from 'react-router';
import { FormTitle } from '../../../../components/Form';
import {
  MenuList,
  MenuPresentational,
  MenuSubList,
} from '@mediarithmics-private/mcs-components-library';
import messages from './messages';
import FormLayoutActionbar, {
  FormLayoutActionbarProps,
} from '../../../../components/Layout/FormLayoutActionbar';
import { IPluginService } from '../../../../services/PluginService';
import {
  IMAGE_SKINS_AD_RENDERER,
  EXTERNAL_AD_RENDERER,
  HTML_AD_RENDRER,
  IMAGE_AD_RENDERER,
} from './domain';
import { lazyInject } from '../../../../config/inversify.config';
import { TYPES } from '../../../../constants/types';
import { SubMenu } from '@mediarithmics-private/mcs-components-library/lib/components/form-menu/menu-sub-list/MenuSubList';

const { Content } = Layout;

const imageAdRendererId = IMAGE_AD_RENDERER;
const htmlAdRendererId = HTML_AD_RENDRER;
const externalAdRendererId = EXTERNAL_AD_RENDERER;
const imageSkinsAdRendererId = IMAGE_SKINS_AD_RENDERER;

export interface DisplayCreativeRendererSelectorProps {
  onSelect: (adRendererId: string) => void;
  close: () => void;
}

interface State {
  adRendererSubmenu: SubMenu[];
}

type Props = DisplayCreativeRendererSelectorProps &
  InjectedIntlProps &
  RouteComponentProps<{ organisationId: string }>;

class DisplayCreativeRendererSelector extends React.Component<Props, State> {
  @lazyInject(TYPES.IPluginService)
  private _pluginService: IPluginService;

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

    return this._pluginService
      .getPlugins({
        max_results: 1000,
        plugin_type: 'DISPLAY_AD_RENDERER',
      })
      .then(resp => resp.data)
      .then(adRendererList => {
        return adRendererList
          .filter(ad => !previousAdRendererIds.includes(ad.id))
          .map(adRenderer => {
            const separators = ['_', '-'];
            const formattedName = adRenderer.artifact_id
              .split(new RegExp(separators.join('|'), 'g'))
              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ');
            return {
              title: formattedName,
              select: () => onSelect(adRenderer.id),
            };
          });
      });
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
      pathItems: [formatMessage(messages.creativeCreationBreadCrumb)],
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

              <Row className="mcs-selector_container">
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
                    submenu={this.renderAdRendererSubmenu}
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
