import * as React from 'react';
import { LoadingCounterValue } from '../../../components/Counter/Counter';
import { QueryDocument } from '../../../models/datamart/graphdb/QueryDocument';
import McsIcon from '../../../components/McsIcon';
import { injectIntl, InjectedIntlProps, FormattedMessage } from 'react-intl';
import { compose } from 'recompose';
import { Button, Alert } from 'antd';
import { injectDrawer } from '../../../components/Drawer';
import { InjectedDrawerProps } from '../../../components/Drawer/injectDrawer';
import JSONQLBuilderContainer, {
  JSONQLBuilderContainerProps,
} from './JSONQLBuilderContainer';
import ActionBar from '../../../components/ActionBar';
import { messages } from './messages';

export type JSONQLPreviewContext = 'GOALS' | 'AUTOMATION_BUILDER';

export interface JSONQLPreviewProps {
  value?: string | void;
  queryHasChanged?: boolean;
  onChange?: (e: string) => void;
  datamartId: string;
  context: JSONQLPreviewContext;
  isTrigger?: boolean;
  isEdge?: boolean;
}

export interface View extends LoadingCounterValue {
  name: string;
}

type Props = JSONQLPreviewProps & InjectedIntlProps & InjectedDrawerProps;

class JSONQLPreview extends React.Component<Props> {
  openEditor = () => {
    const { intl, value } = this.props;

    const actionbar = (query: QueryDocument, datamartId: string) => {
      const onSave = () => {
        if (this.props.onChange) this.props.onChange(JSON.stringify(query));
        this.props.closeNextDrawer();
      };
      const onClose = () => this.props.closeNextDrawer();
      return (
        <ActionBar
          edition={true}
          paths={[
            {
              name: intl.formatMessage({
                id: 'jsonql.querytool.query.edit',
                defaultMessage: 'Edit Your Query',
              }),
            },
          ]}
        >
          <Button
            disabled={!query}
            className="mcs-primary"
            type="primary"
            onClick={onSave}
          >
            <FormattedMessage
              id="queryTool.jsonql.querytool.query.edit.update"
              defaultMessage="Update"
            />
          </Button>
          <McsIcon
            type="close"
            className="close-icon"
            style={{ cursor: 'pointer' }}
            onClick={onClose}
          />
        </ActionBar>
      );
    };

    this.props.openNextDrawer<JSONQLBuilderContainerProps>(
      JSONQLBuilderContainer,
      {
        additionalProps: {
          datamartId: this.props.datamartId,
          renderActionBar: actionbar,
          editionLayout: true,
          queryDocument: value ? JSON.parse(value) : undefined,
          isTrigger: this.props.isTrigger,
          isEdge: this.props.isEdge,
        },
      },
    );
  };

  render() {
    const { context, queryHasChanged, intl } = this.props;

    return context === 'AUTOMATION_BUILDER' ? (
      <div onClick={this.openEditor} className="boolean-menu-item">
        {this.props.intl.formatMessage({
          id: 'jsonql.button.query.edit',
          defaultMessage: 'Edit Query',
        })}
      </div>
    ) : (
      <div className="text-center m-t-20">
        {queryHasChanged && (
          <Alert
            message={
              <div>
                <McsIcon type={'warning'} />
                {intl.formatMessage(messages.queryHasChanged)}
              </div>
            }
            type={'warning'}
          />
        )}
        <br />
        <Button onClick={this.openEditor}>
          {this.props.intl.formatMessage({
            id: 'jsonql.button.query.edit',
            defaultMessage: 'Edit Query',
          })}
        </Button>
      </div>
    );
  }
}

export default compose<Props, JSONQLPreviewProps>(
  injectIntl,
  injectDrawer,
)(JSONQLPreview);
