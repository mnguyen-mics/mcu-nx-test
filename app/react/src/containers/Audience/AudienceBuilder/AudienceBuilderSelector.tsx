import * as React from 'react';
import { compose } from 'recompose';
import { Layout, Row, Alert } from 'antd';
import { defineMessages, injectIntl, InjectedIntlProps } from 'react-intl';
import {
  MenuList,
  Actionbar,
  McsIcon,
} from '@mediarithmics-private/mcs-components-library';
import FormLayoutActionbar, {
  FormLayoutActionbarProps,
} from '../../../components/Layout/FormLayoutActionbar';
import { AudienceBuilderResource } from '../../../models/audienceBuilder/AudienceBuilderResource';
import cuid from 'cuid';
import { DatamartWithMetricResource } from '../../../models/datamart/DatamartResource';

export const messages = defineMessages({
  subTitle: {
    id: 'audienceBuilderSelector.subtitle',
    defaultMessage: 'Audience Builders',
  },
  noAudienceBuilder: {
    id: 'datamart.audienceBuilder.alert.noAudienceBuilder',
    defaultMessage:
      'No Audience Builder found for selected datamart. Please create one to proceed or contact the support team.',
  },
});

export interface AudienceBuilderSelectorProps {
  audienceBuildersByDatamartId?: AudienceBuilderResource[][];
  datamarts: DatamartWithMetricResource[];
  onSelect: (audienceBuilderId: string) => void;
  actionbarProps: FormLayoutActionbarProps;
  isMainlayout?: boolean;
}

type Props = AudienceBuilderSelectorProps & InjectedIntlProps;

class AudienceBuilderSelector extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
    this.state = {};
  }

  render() {
    const {
      onSelect,
      actionbarProps,
      isMainlayout,
      audienceBuildersByDatamartId,
      intl,
      datamarts,
    } = this.props;

    return (
      <Layout>
        {isMainlayout ? (
          <Actionbar {...actionbarProps} />
        ) : (
          <FormLayoutActionbar {...actionbarProps} />
        )}
        <Layout.Content className="mcs-content-container mcs-form-container text-center">
          {!audienceBuildersByDatamartId ||
          audienceBuildersByDatamartId.length === 0 ? (
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
                {audienceBuildersByDatamartId.map((builders, i) => {
                  return (
                    <div key={i}>
                      <div className="mcs-datamartName_title">
                        {
                          datamarts.find(d => d.id === builders[0].datamart_id)
                            ?.name
                        }
                      </div>

                      {builders.map(b => {
                        const handleSelect = () => onSelect(b.id);
                        return (
                          <MenuList
                            key={cuid()}
                            title={b.name}
                            select={handleSelect}
                          />
                        );
                      })}
                    </div>
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

export default compose<Props, AudienceBuilderSelectorProps>(injectIntl)(
  AudienceBuilderSelector,
);
