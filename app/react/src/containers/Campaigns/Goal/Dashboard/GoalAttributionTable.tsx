import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { compose } from 'recompose';
import {
  CampaignStatData,
  CreativeStatData,
  SourceStatData,
} from './GoalAttribution';
import messages from './messages';
import { Link } from 'react-router-dom';
import ObjectRenderer from '../../../ObjectRenderer/ObjectRenderer';
import { DisplayCampaignResource } from '../../../../models/campaign/display/DisplayCampaignResource';
import { GenericCreativeResource } from '../../../../models/creative/CreativeResource';
import { lazyInject } from '../../../../config/inversify.config';
import { TYPES } from '../../../../constants/types';
import { ICreativeService } from '../../../../services/CreativeService';
import { IDisplayCampaignService } from '../../../../services/DisplayCampaignService';
import { DataColumnDefinition } from '@mediarithmics-private/mcs-components-library/lib/components/table-view/table-view/TableView';
import { TableViewWrapper } from '../../../../components/TableView';

export interface GoalAttributionTableProps {
  dataSource: CampaignStatData | CreativeStatData | SourceStatData;
  uniq: string[];
  isLoading: boolean;
}

interface Router {
  organisationId: string;
  goalId: string;
}

interface Record {
  id: string;
}

type JoinedProps = GoalAttributionTableProps &
  RouteComponentProps<Router> &
  InjectedIntlProps;

class GoalAttributionTable extends React.Component<JoinedProps> {
  @lazyInject(TYPES.ICreativeService)
  private _creativeService: ICreativeService;

  @lazyInject(TYPES.IDisplayCampaignService)
  private _displayCampaignService: IDisplayCampaignService;

  buildNameColumn = () => {
    const {
      dataSource,
      match: {
        params: { organisationId },
      },
      intl: {formatMessage}
    } = this.props;

    let columns: Array<DataColumnDefinition<Record>> = [];

    if (dataSource.viewType === 'SOURCE') {
      columns = [
        {
          title: formatMessage(messages.marketingChannel),
          key: 'marketingChannel',
          render: (text: string, record: Record, index: number) => record.id,
        },
        {
          title: formatMessage(messages.source),
          key: 'source',
          render: (text: string, record: Record, index: number) => {
            const sourceStat = dataSource.dataSource.find(
              item => item.marketing_channel === record.id,
            );
            return sourceStat && sourceStat.source;
          },
        },
      ];
    } else if (dataSource.viewType === 'CAMPAIGN') {
      columns = [
        {
          title: formatMessage(messages.campaignName),
          key: 'marketingChannel',
          render: (text: string, record: Record, index: number) => {
            const campaignStat = dataSource.dataSource.find(
              item => item.campaign_id === record.id,
            );
            const name = campaignStat && campaignStat.campaign_name;
            const link = `/v2/o/${organisationId}/campaigns/display/${
              record.id
            }`;
            const renderName = (c: DisplayCampaignResource) => (
              <span>{c.name}</span>
            );
            return (
              <Link to={link}>
                {name ? (
                  name
                ) : (
                  <ObjectRenderer
                    fetchingMethod={
                      this._displayCampaignService.getCampaignDisplay
                    }
                    id={record.id}
                    renderMethod={renderName}
                  />
                )}
              </Link>
            );
          },
        },
      ];
    } else if (dataSource.viewType === 'CREATIVES') {
      columns = [
        {
          title: formatMessage(messages.creativeName),
          key: 'marketingChannel',
          render: (text: string, record: Record, index: number) => {
            const creativeName = dataSource.dataSource.find(
              item => item.creative_id === record.id,
            );
            const name = creativeName && creativeName.creative_name;
            const link = `/v2/o/${organisationId}/creatives/display/edit/${
              record.id
            }`;
            const renderName = (c: GenericCreativeResource) => (
              <span>{c.name}</span>
            );
            return (
              <Link to={link}>
                {name ? (
                  name
                ) : (
                  <ObjectRenderer
                    fetchingMethod={this._creativeService.getCreative}
                    id={record.id}
                    renderMethod={renderName}
                  />
                )}
              </Link>
            );
          },
        },
      ];
    }

    return columns;
  };

  returnListOfItemFromId = (id: string, reduceFunction: string) => {
    const { dataSource } = this.props;
    switch (dataSource.viewType) {
      case 'SOURCE':
        return (
          dataSource.dataSource.filter(item => item.marketing_channel === id) ||
          []
        ).reduce((acc: number, item) => {
          switch (reduceFunction) {
            case 'weightedConversions':
              return acc + parseInt(item.weighted_conversions, 10);
            case 'weightedValue':
              return acc + parseInt(item.weighted_value, 10);
            case 'postViewWeightedConversions':
              return item.interaction_type === 'POST_VIEW'
                ? acc + item.weighted_conversions
                : acc;
            case 'postClickWeightedConversions':
              return item.interaction_type === 'POST_CLICK'
                ? acc + item.weighted_conversions
                : acc;
            default:
              return 0;
          }
        }, 0);
      case 'CAMPAIGN':
        return (
          dataSource.dataSource.filter(item => item.campaign_id === id) || []
        ).reduce((acc: number, item) => {
          switch (reduceFunction) {
            case 'weightedConversions':
              return acc + parseInt(item.weighted_conversions, 10);
            case 'weightedValue':
              return acc + parseInt(item.weighted_value, 10);
            case 'postViewWeightedConversions':
              return item.interaction_type === 'POST_VIEW'
                ? acc + item.weighted_conversions
                : acc;
            case 'postClickWeightedConversions':
              return item.interaction_type === 'POST_CLICK'
                ? acc + item.weighted_conversions
                : acc;
            default:
              return 0;
          }
        }, 0);
      case 'CREATIVES':
        return (
          dataSource.dataSource.filter(item => item.creative_id === id) || []
        ).reduce((acc: number, item) => {
          switch (reduceFunction) {
            case 'weightedConversions':
              return acc + parseInt(item.weighted_conversions, 10);
            case 'weightedValue':
              return acc + parseInt(item.weighted_value, 10);
            case 'postViewWeightedConversions':
              return item.interaction_type === 'POST_VIEW'
                ? acc + item.weighted_conversions
                : acc;
            case 'postClickWeightedConversions':
              return item.interaction_type === 'POST_CLICK'
                ? acc + item.weighted_conversions
                : acc;
            default:
              return 0;
          }
        }, 0);
    }
  };

  buildDataColumn = () => {
    return [
      {
        intlMessage: messages.weightedConversions,
        key: 'weightedConversions',
        render: (text: string, record: any, index: number) => {
          return this.returnListOfItemFromId(record.id, 'weightedConversions');
        },
      },
      {
        intlMessage: messages.weightedValue,
        key: 'weightedValue',
        render: (text: string, record: any, index: number) => {
          return this.returnListOfItemFromId(record.id, 'weightedValue');
        },
      },
      {
        intlMessage: messages.postViewWeightedConversions,
        key: 'postViewWeightedConversions',
        render: (text: string, record: any, index: number) => {
          return this.returnListOfItemFromId(
            record.id,
            'postViewWeightedConversions',
          );
        },
      },
      {
        intlMessage: messages.postClickWeightedConversions,
        key: 'postClickWeightedConversions',
        render: (text: string, record: any, index: number) => {
          return this.returnListOfItemFromId(
            record.id,
            'postClickWeightedConversions',
          );
        },
      },
    ];
  };

  buildColumnDefinition = () => {
    const column = [...this.buildNameColumn(), ...this.buildDataColumn()];

    return {
      dataColumnsDefinition: column,
    };
  };

  render() {
    const uniq = this.props.uniq.map(item => {
      return { id: item };
    });
    return (
      <TableViewWrapper
        loading={this.props.isLoading}
        columns={this.buildColumnDefinition().dataColumnsDefinition}
        dataSource={uniq}
      />
    );
  }
}

export default compose<JoinedProps, GoalAttributionTableProps>(
  withRouter,
  injectIntl,
)(GoalAttributionTable);
