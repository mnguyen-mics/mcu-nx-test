import * as React from 'react';
import { compose } from 'recompose';
import { Layout, Row, Alert } from 'antd';
import { defineMessages, injectIntl, InjectedIntlProps } from 'react-intl';
import { FormTitle } from '../../../components/Form';
import {
  MenuList,
  Actionbar,
  McsIcon,
} from '@mediarithmics-private/mcs-components-library';
import FormLayoutActionbar, {
  FormLayoutActionbarProps,
} from '../../../components/Layout/FormLayoutActionbar';
import cuid from 'cuid';
import { AudienceBuilderResource } from '../../../models/audienceBuilder/AudienceBuilderResource';
import { injectWorkspace, InjectedWorkspaceProps } from '../../Datamart';
import { DatamartWithMetricResource } from '../../../models/datamart/DatamartResource';

export const messages = defineMessages({
  title: {
    id: 'audienceBuilderSelector.title',
    defaultMessage: 'Audience Builder',
  },
  subTitle: {
    id: 'audienceBuilderSelector.subtitle',
    defaultMessage: 'Choose your Audience Builder',
  },
  noAudienceBuilder: {
    id: 'datamart.audienceBuilder.alert.noAudienceBuilder',
    defaultMessage:
      'No Audience Builder found for selected datamart. Please create one to proceed or contact the support team.',
  },
});

export interface AudienceBuilderSelectorProps {
  audienceBuilders: AudienceBuilderResource[];
  datamartId: string;
  onSelect: (audienceBuilder: AudienceBuilderResource) => void;
  actionbarProps: FormLayoutActionbarProps;
  isMainlayout?: boolean;
}

type Props = AudienceBuilderSelectorProps &
  InjectedIntlProps &
  InjectedWorkspaceProps;

interface State {
  datamart?: DatamartWithMetricResource;
}

class AudienceBuilderSelector extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    const { workspace, datamartId } = this.props;
    this.setState({
      datamart: workspace.datamarts.find(d => d.id === datamartId),
    });
  }

  render() {
    const {
      onSelect,
      actionbarProps,
      isMainlayout,
      audienceBuilders,
      intl,
    } = this.props;

    const { datamart } = this.state;

    return (
      <Layout>
        {isMainlayout ? (
          <Actionbar {...actionbarProps} />
        ) : (
          <FormLayoutActionbar {...actionbarProps} />
        )}
        <Layout.Content className="mcs-content-container mcs-form-container text-center">
          <FormTitle title={messages.title} subtitle={messages.subTitle} />

          {audienceBuilders.length === 0 ? (
            <Alert
              message={
                <div>
                  <McsIcon type={'warning'} />
                  {intl.formatMessage(messages.noAudienceBuilder)}
                </div>
              }
              type={'warning'}
            />
          ) : (
            <Row className="mcs-selector_container">
              <Row className="menu">
                {audienceBuilders.map(b => {
                  const handleSelect = () => onSelect(b);
                  return (
                    <MenuList
                      key={cuid()}
                      title={`${b.name} ${datamart && `(${datamart.name})`}`}
                      select={handleSelect}
                    />
                  );
                })}
              </Row>
            </Row>
          )}
        </Layout.Content>
      </Layout>
    );
  }
}

export default compose<Props, AudienceBuilderSelectorProps>(
  injectIntl,
  injectWorkspace,
)(AudienceBuilderSelector);
