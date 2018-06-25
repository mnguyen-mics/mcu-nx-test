import * as React from 'react';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { Layout, Row } from 'antd';
import { RouteComponentProps, withRouter } from 'react-router';
import { FormTitle } from '../../../../components/Form';
import {
  MenuSubList,
} from '../../../../components/FormMenu';
import messages from './../../DisplayAds/Edit/messages';
import FormLayoutActionbar, {
  FormLayoutActionbarProps,
} from '../../../../components/Layout/FormLayoutActionbar';
import { Submenu } from '../../../../components/FormMenu/MenuSubList';

const { Content } = Layout;

const nativeIvidenceAdRendererId = '1032';
const nativeQuantumAdRendererId = '1047';

export interface NativeCreativeRendererSelectorProps {
  onSelect: (adRendererId: string) => void;
  close: () => void;
}

interface State {
  adRendererSubmenu: Submenu[];
}

type Props = NativeCreativeRendererSelectorProps &
  InjectedIntlProps &
  RouteComponentProps<{ organisationId: string }>;

class NativeCreativeRendererSelector extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      adRendererSubmenu: [],
    };
  }

  renderNativeSubmenu = () => {
    const {
      onSelect,
      intl: { formatMessage },
    } = this.props;

    return [
      {
        title: formatMessage(messages.creativeTypeQuantum),
        select: () => onSelect(nativeQuantumAdRendererId),
      },
      {
        title: formatMessage(messages.creativeTypeIvidence),
        select: () => onSelect(nativeIvidenceAdRendererId),
      },
    ];
  };

  render() {
    const {
      intl: { formatMessage },
    } = this.props;

    const actionBarProps: FormLayoutActionbarProps = {
      formId: 'typePickerForm',
      onClose: this.props.close,
      paths: [
        {
          name: messages.nativeCreationBreadCrumb,
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
              {
                <Row style={{ width: '650px', display: 'inline-block' }}>
                  <Row className="menu">
                    <MenuSubList
                      title={formatMessage(messages.creativeTypeNative)}
                      subtitles={[
                        formatMessage(messages.creativeTypeQuantum),
                        formatMessage(messages.creativeTypeIvidence),
                      ]}
                      submenu={this.renderNativeSubmenu()}
                    />
                  </Row>
                </Row>
              }
            </Content>
          </Layout>
        </div>
      </Layout>
    );
  }
}

export default withRouter(injectIntl(NativeCreativeRendererSelector));
