import { InfoCircleFilled } from '@ant-design/icons';
import { Card, EmptyChart, TableViewFilters } from '@mediarithmics-private/mcs-components-library';
import { DataColumnDefinition } from '@mediarithmics-private/mcs-components-library/lib/components/table-view/table-view/TableView';
import { Tabs, Tooltip } from 'antd';
import * as React from 'react';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import { compose } from 'recompose';
import { ContextualTargetingResource } from '../../../../../models/contextualtargeting/ContextualTargeting';
import { ContextualKeyResource, SignatureScoredCategoryResource } from './ContextualTargetingTab';
import { messages } from './messages';

const { TabPane } = Tabs;

interface ContextualTargetingSubTabsProps {
  contextualTargeting?: ContextualTargetingResource;
  targetedContextualKeyResources?: ContextualKeyResource[];
  isLoadingContextualKeys: boolean;
  signatureScoredCategoryResources?: SignatureScoredCategoryResource[];
  isLoadingSignature: boolean;
}

interface State {
  activeTabKey: string;
}

type Props = ContextualTargetingSubTabsProps & InjectedIntlProps;

class ContextualTargetingSubTabs extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      activeTabKey: '0',
    };
  }

  onTabChange = (activeKey: string) => {
    this.setState({ activeTabKey: activeKey });
  };

  render() {
    const { intl } = this.props;
    const { activeTabKey } = this.state;
    const {
      targetedContextualKeyResources,
      isLoadingContextualKeys,
      signatureScoredCategoryResources,
      isLoadingSignature,
      contextualTargeting,
    } = this.props;

    const liftDataColumnsDefinition: Array<DataColumnDefinition<ContextualKeyResource>> = [
      {
        title: intl.formatMessage(messages.content),
        key: 'contextual_key',
        isVisibleByDefault: true,
        isHideable: false,
      },
      {
        title: intl.formatMessage(messages.lift),
        key: 'lift',
        isVisibleByDefault: true,
        isHideable: false,
      },
      {
        title: intl.formatMessage(messages.numberOfEvents),
        key: 'occurrences_in_datamart_count',
        isVisibleByDefault: true,
        isHideable: false,
      },
    ];

    const signatureDataColumnsDefinition: Array<
      DataColumnDefinition<SignatureScoredCategoryResource>
    > = [
      {
        title: intl.formatMessage(messages.category),
        key: 'category_name',
        isVisibleByDefault: true,
        isHideable: false,
      },
      {
        title: intl.formatMessage(messages.score),
        key: 'weight',
        isVisibleByDefault: true,
        isHideable: false,
      },
    ];

    const lastLiftComputation =
      contextualTargeting &&
      contextualTargeting.last_lift_computation_ts &&
      new Date(contextualTargeting.last_lift_computation_ts);

    return (contextualTargeting?.status === 'DRAFT' ||
      contextualTargeting?.status === 'PUBLISHED') &&
      lastLiftComputation ? (
      <Card
        title={
          <React.Fragment>
            {intl.formatMessage(messages.targetedContentTab)}
            <Tooltip
              className='mcs-contextualTargetingDashboard_lastRefreshDate'
              title={intl.formatMessage(messages.liftRefreshTooltip)}
              placement='left'
            >
              <InfoCircleFilled />
            </Tooltip>
          </React.Fragment>
        }
        className='mcs-contextualTargetingDashboard_contextualTargetingTableContainer'
      >
        <TableViewFilters
          dataSource={targetedContextualKeyResources ? targetedContextualKeyResources : []}
          loading={isLoadingContextualKeys}
          columns={liftDataColumnsDefinition}
        />
      </Card>
    ) : (contextualTargeting?.status === 'LIVE' ||
        contextualTargeting?.status === 'LIVE_PUBLISHED') &&
      lastLiftComputation ? (
      <Card className='mcs-contextualTargetingDashboard_contextualTargetingTableContainer'>
        {activeTabKey === '0' ? (
          <Tooltip
            className='mcs-contextualTargetingDashboard_lastRefreshDate'
            title={intl.formatMessage(messages.liftRefreshTooltip)}
            placement='left'
          >
            <InfoCircleFilled />
          </Tooltip>
        ) : (
          <Tooltip
            className='mcs-contextualTargetingDashboard_lastRefreshDate'
            title={intl.formatMessage(messages.signatureRefreshTooltip)}
            placement='left'
          >
            <InfoCircleFilled />
          </Tooltip>
        )}
        <Tabs defaultActiveKey={'0'} onChange={this.onTabChange}>
          <TabPane tab={intl.formatMessage(messages.targetedContentTab)} key={'0'}>
            <TableViewFilters
              dataSource={targetedContextualKeyResources ? targetedContextualKeyResources : []}
              loading={isLoadingContextualKeys}
              columns={liftDataColumnsDefinition}
            />
          </TabPane>
          <TabPane tab={intl.formatMessage(messages.semanticAnalysisTab)} key={'1'}>
            {signatureScoredCategoryResources ? (
              <React.Fragment>
                <TableViewFilters
                  dataSource={
                    signatureScoredCategoryResources ? signatureScoredCategoryResources : []
                  }
                  loading={isLoadingSignature}
                  columns={signatureDataColumnsDefinition}
                />
              </React.Fragment>
            ) : (
              <EmptyChart
                title={intl.formatMessage(messages.InitializationTabText)}
                icon='optimization'
              />
            )}
          </TabPane>
        </Tabs>
      </Card>
    ) : (
      <div />
    );
  }
}

export default compose<Props, ContextualTargetingSubTabsProps>(injectIntl)(
  ContextualTargetingSubTabs,
);
