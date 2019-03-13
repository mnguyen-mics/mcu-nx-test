 import * as React from 'react';
import { injectIntl, InjectedIntlProps, FormattedMessage } from 'react-intl';
import { withRouter } from 'react-router-dom';
import { Switch, Modal } from 'antd';
import { compose } from 'recompose';
import { RouteComponentProps } from 'react-router';

import { TableView } from '../../../../../components/TableView/index';
import { formatMetric } from '../../../../../utils/MetricHelper';
import McsIcon from '../../../../../components/McsIcon';
import ButtonStyleless from '../../../../../components/ButtonStyleless';
import messages from '../messages';
import {
  AdResource,
  AdInfoResource,
} from '../../../../../models/campaign/display/index';
import { Popover } from '../../../../../components/PopupContainers/index';
import { UpdateMessage } from '../ProgrammaticCampaign/DisplayCampaignAdGroupTable';
import { ExtendedTableRowSelection, ActionsColumnDefinition } from '../../../../../components/TableView/TableView';
import injectDrawer, { InjectedDrawerProps } from '../../../../../components/Drawer/injectDrawer';
import ResourceTimelinePage, { ResourceTimelinePageProps } from '../../../../ResourceHistory/ResourceTimeline/ResourceTimelinePage';
import resourceHistoryMessages from '../../../../ResourceHistory/ResourceTimeline/messages';
import { getLinkedResourceIdInSelection } from '../../../../../utils/ResourceHistoryHelper';
import DisplayCampaignService from '../../../../../services/DisplayCampaignService';
import formatCreativeProperty from '../../../../../messages/creative/creativeMessages';

interface DisplayCampaignAdTableProps {
  isFetching: boolean;
  isFetchingStat: boolean;
  dataSet?: AdInfoResource[];
  updateAd: (
    adId: string,
    body: Partial<AdResource>,
    successMessage: UpdateMessage,
    errorMessage: UpdateMessage,
    undoBody: Partial<AdResource>,
  ) => void;
  rowSelection?: ExtendedTableRowSelection;
}

interface DisplayCampaignAdTableState {
  pageSize: number;
}

type JoinedProps = DisplayCampaignAdTableProps &
  InjectedIntlProps &
  RouteComponentProps<{ organisationId: string , campaignId: string}> &
  InjectedDrawerProps;

class DisplayCampaignAdTable extends React.Component<
  JoinedProps,
  DisplayCampaignAdTableState
  > {
  constructor(props: JoinedProps) {
    super(props);
    this.state = {
      pageSize: 10,
    };
  }

  editCampaign = (ad: AdResource) => {
    const {
      match: { params: { organisationId } },
      history,
      location,
    } = this.props;

    const editUrl = `/v2/o/${organisationId}/creatives/display/edit/${ad.creative_id}`;

    history.push({
      pathname: editUrl,
      state: { from: `${location.pathname}${location.search}` },
    });
  };

  archiveAd = (ad: AdResource) => {
    const { intl: { formatMessage } } = this.props;

    Modal.confirm({
      title: formatMessage(messages.creativeModalConfirmArchivedTitle),
      content: formatMessage(messages.creativeModalConfirmArchivedContent),
      iconType: 'exclamation-circle',
      okText: formatMessage(messages.creativeModalConfirmArchivedOk),
      cancelText: formatMessage(messages.cancelText),
      onOk() {
        //
      },
      onCancel() {
        //
      },
    });
  };

  openHistoryDrawer = (record: AdResource) => {
    const {
      match: {
        params: { organisationId, campaignId },
      },
      history,
    } = this.props;
    
    this.props.openNextDrawer<ResourceTimelinePageProps>(
      ResourceTimelinePage,
      {
        additionalProps: {
          resourceType: 'CREATIVE',
          resourceId: record.creative_id,
          handleClose: () => this.props.closeNextDrawer(),
          formatProperty: formatCreativeProperty, // change this
          resourceLinkHelper: {
            AD: {
              direction: 'PARENT',
              getType: () => {
                return (
                  <FormattedMessage
                    {...resourceHistoryMessages.adGroupResourceType}/>
                );
              },
              getName: (id: string) => {
                return getLinkedResourceIdInSelection(
                  organisationId,
                  'AD',
                  id,
                  'AD_GROUP',
                ).then(adGroupId => {
                  return DisplayCampaignService.getAdGroup(campaignId, adGroupId)
                    .then(adGroupResponse => adGroupResponse.data.name);
                });
              },
              goToResource: (id: string) => {
                return getLinkedResourceIdInSelection(
                  organisationId,
                  'AD',
                  id,
                  'AD_GROUP',
                ).then(adGroupId => {
                  history.push(
                    `/v2/o/${organisationId}/campaigns/display/${campaignId}/adgroups/${adGroupId}`,
                  );
                });
              },
            },
          },
        },
        size: 'small',
      }
    )
  }

  render() {
    const {
      match: { params: { organisationId } },
      location,
      history,
      isFetching,
      isFetchingStat,
      dataSet,
      intl: { formatMessage },
      rowSelection,
    } = this.props;

    const renderMetricData = (
      value: any,
      numeralFormat: string,
      currency = '',
    ) => {
      if (isFetchingStat) {
        return <i className="mcs-table-cell-loading" />;
      }
      const unlocalizedMoneyPrefix = currency === 'EUR' ? '€ ' : '';
      return formatMetric(value, numeralFormat, unlocalizedMoneyPrefix);
    };


    const sorter = (a: any, b: any, key: string) => {
      if (a[key] === undefined && b[key] === undefined) {
        return 0;
      }
      if (a[key] === undefined) {
        return -b[key];
      }
      if (b[key] === undefined) {
        return a[key];
      }
      return a[key] - b[key];
    };

    const changeAdStatus = (record: AdResource, checked: boolean) => {
      const { updateAd } = this.props;

      const status = checked ? 'ACTIVE' : 'PAUSED';
      const initialStatus = checked ? 'PAUSED' : 'ACTIVE';
      const successMessage = checked
        ? {
          title: formatMessage(messages.notificationSuccess),
          body: formatMessage(messages.notificationAdActivationSuccess, {
            name: record.name,
          }),
        }
        : {
          title: formatMessage(messages.notificationSuccess),
          body: formatMessage(messages.notificationAdPauseSuccess, {
            name: record.name,
          }),
        };
      const errorMessage = checked
        ? {
          title: formatMessage(messages.notificationError),
          body: formatMessage(messages.notificationAdActivationError, {
            name: record.name,
          }),
        }
        : {
          title: formatMessage(messages.notificationError),
          body: formatMessage(messages.notificationAdPauseError, {
            name: record.name,
          }),
        };
      updateAd(
        record.id,
        {
          status,
        },
        successMessage,
        errorMessage,
        {
          status: initialStatus,
        },
      );
    };

    const dataColumns = [
      {
        key: 'creative_audit_status',
        isHideable: false,
        render: (text: string) => (
          // Popover used instead of tooltip because of row translation bug on hover
          <Popover
            content={
              text === 'AUDIT_PASSED' ? (
                <FormattedMessage
                  id="display.campaign.adtable.ad.auditpassed.msg"
                  defaultMessage="Audit sucessful"
                />
              ) : (
                  <FormattedMessage
                    id="display.campaign.adtable.ad.noaudit.msg"
                    defaultMessage="You need to pass the Audit first"
                  />
                )
            }
          >
            <McsIcon
              className={
                text === 'AUDIT_PASSED' ? 'font-success' : 'font-error'
              }
              type={text === 'AUDIT_PASSED' ? 'check' : 'close'}
            />
          </Popover>
        ),
        width: 10,
      },
      {
        translationKey: 'STATUS',
        key: 'status',
        isHideable: false,
        render: (text: string, record: AdResource) => {
          const onChange = (checked: boolean) => {
            changeAdStatus(record, checked);
          };
          return (
            <span>
              <Switch
                className="mcs-table-switch"
                checked={text === 'ACTIVE'}
                onChange={onChange}
                checkedChildren={
                  <McsIcon style={{ verticalAlign: 'middle' }} type="play" />
                }
                unCheckedChildren={
                  <McsIcon style={{ verticalAlign: 'middle' }} type="pause" />
                }
              />
            </span>
          );
        },
      },
      {
        key: 'image',
        isVisibleByDefault: true,
        isHideable: true,
        render: (text: string, record: AdResource) => <div
          style={{
            display: 'flex',
            alignItems: 'center',
            alignContent: 'center',
            justifyContent: 'center',
            minWidth: '100px',
            minHeight: '100px',
          }}
        >
          <img
            src={`https://ads.mediarithmics.com/ads/screenshot?rid=${record.creative_id}`}
            alt={record.name}
            style={{ maxHeight: 100, maxWidth: 100 }}
          />
        </div>,
      },
      {
        translationKey: 'NAME',
        key: 'name',
        isHideable: false,
        render: (text: string, record: AdResource) => {
          const editCreative = () => {
            history.push({
              pathname: `/v2/o/${organisationId}/creatives/display/edit/${
                record.creative_id
                }`,
              state: { from: `${location.pathname}${location.search}` },
            });
          };
          return (
            <ButtonStyleless onClick={editCreative}><a>{text}</a></ButtonStyleless>
          );
        },
      },
      {
        translationKey: 'IMPRESSIONS',
        key: 'impressions',
        isVisibleByDefault: true,
        isHideable: true,
        render: (text: string) => renderMetricData(text, '0,0'),
        sorter: (a: any, b: any) => sorter(a, b, 'impressions'),
      },
      {
        translationKey: 'CLICKS',
        key: 'clicks',
        isVisibleByDefault: true,
        isHideable: true,
        render: (text: string) => renderMetricData(text, '0,0'),
        sorter: (a: any, b: any) => sorter(a, b, 'clicks'),
      },
      {
        translationKey: 'CPM',
        key: 'cpm',
        isVisibleByDefault: true,
        isHideable: true,
        render: (text: string) => renderMetricData(text, '0,0.00', 'EUR'),
        sorter: (a: any, b: any) => sorter(a, b, 'cpm'),
      },
      {
        translationKey: 'CTR',
        key: 'ctr',
        isVisibleByDefault: true,
        isHideable: true,
        render: (text: string) =>
          renderMetricData(parseFloat(text) / 100, '0.000 %'),
        sorter: (a: any, b: any) => sorter(a, b, 'ctr'),
      },
      {
        translationKey: 'CPC',
        key: 'cpc',
        isVisibleByDefault: true,
        isHideable: true,
        render: (text: string) => renderMetricData(text, '0,0.00', 'EUR'),
        sorter: (a: any, b: any) => sorter(a, b, 'cpc'),
      },
      {
        translationKey: 'IMPRESSIONS_COST',
        key: 'impressions_cost',
        isVisibleByDefault: true,
        isHideable: true,
        render: (text: string) => renderMetricData(text, '0,0.00', 'EUR'),
        sorter: (a: any, b: any) => sorter(a, b, 'impressions_cost'),
      },
    ];

    const actionColumns:  Array<ActionsColumnDefinition<AdResource>> = [
      {
        key: 'action',
        actions: () => [
          {
            translationKey: 'EDIT',
            callback: this.editCampaign,
          },
          {
            translationKey: 'HISTORY',
            callback: this.openHistoryDrawer,
          },
          {
            translationKey: 'ARCHIVE',
            callback: this.archiveAd,
          },
        ],
      },
    ];

    const pagination = {
      pageSize: this.state.pageSize,
      total: this.props.dataSet ? this.props.dataSet.length : 0,
      onShowSizeChange: (current: number, size: number) =>
        this.setState({
          pageSize: size,
        }),
      onChange: (page: number) => {
        if (
          rowSelection &&
          rowSelection.unselectAllItemIds &&
          rowSelection.allRowsAreSelected
        ) {
          rowSelection.unselectAllItemIds();
        }
      },
    };

    return (
      <TableView
        columns={dataColumns}
        actionsColumnsDefinition={actionColumns}
        dataSource={dataSet}
        loading={isFetching}
        pagination={pagination}
        rowSelection={rowSelection}
      />
    );
  }
}

export default compose<JoinedProps, DisplayCampaignAdTableProps>(
  injectIntl,
  withRouter,
  injectDrawer,
)(DisplayCampaignAdTable);
