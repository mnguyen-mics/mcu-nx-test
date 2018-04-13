import * as React from 'react';
import { compose } from 'recompose';
import { Layout, Button } from 'antd';
import { FormattedMessage, injectIntl, InjectedIntlProps } from 'react-intl';
import { connect } from 'react-redux';
import ActionBar, { ActionBarProps } from '../../../components/ActionBar';
import JSONQLBuilder from './JSONQLBuilder';
import { ObjectTreeExpressionNodeShape } from '../../../models/datamart/graphdb/QueryDocument';
import { ObjectLikeTypeInfoResource } from '../../../models/datamart/graphdb/RuntimeSchema';
import { Loading, McsIcon } from '../../../components';
import * as SessionHelper from '../../../state/Session/selectors';
import RuntimeSchemaService from '../../../services/RuntimeSchemaService';
import QueryService from '../../../services/QueryService';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../Notifications/injectNotifications';

export interface JSONQLBuilderContainerProps {
  datamartId: string;
  queryId?: string;
  actionbarProps: ActionBarProps;
  onClose?: () => void;
  onSave?: (query: ObjectTreeExpressionNodeShape) => void;
}

interface State {
  loading: boolean;
  objectTypes: ObjectLikeTypeInfoResource[];
  queryHistory: {
    past: Array<ObjectTreeExpressionNodeShape | undefined>;
    present: ObjectTreeExpressionNodeShape | undefined;
    future: ObjectTreeExpressionNodeShape[];
  };
  staleCounters: boolean;
}

type Props = JSONQLBuilderContainerProps &
  InjectedIntlProps &
  InjectedNotificationProps;

class JSONQLBuilderContainer extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      loading: false,
      staleCounters: false,
      objectTypes: [],
      queryHistory: {
        past: [],
        present: undefined,
        future: [],
      },
    };
  }

  componentDidMount() {
    const { datamartId, queryId } = this.props;

    this.setState({ loading: true });
    Promise.all([
      this.fetchObjectTypes(),
      queryId
        ? QueryService.getQuery(datamartId, queryId).then(res => res.data)
        : Promise.resolve(null),
    ])
      .then(([objectTypes, eventualQuery]) => {
        this.setState(prevState => ({
          loading: false,
          objectTypes,
          queryHistory: {
            ...prevState.queryHistory,
          },
        }));
      })
      .catch(err => {
        this.props.notifyError(err);
        this.setState({ loading: false });
      });
  }

  fetchObjectTypes = () => {
    const { datamartId } = this.props;
    return RuntimeSchemaService.getRuntimeSchemas(datamartId).then(
      schemaRes => {
        const liveSchema = schemaRes.data.find(s => s.status === 'LIVE');
        if (!liveSchema) return [];
        return RuntimeSchemaService.getObjectTypes(
          datamartId,
          liveSchema.id,
        ).then(objectRes => {
          return Promise.all(
            objectRes.data.map(object => {
              return RuntimeSchemaService.getFields(
                datamartId,
                liveSchema.id,
                object.id,
              ).then(fieldRes => {
                return {
                  ...object,
                  fields: fieldRes.data,
                };
              });
            }),
          );
        });
      },
    );
  };

  handleUpdateQuery = (query: ObjectTreeExpressionNodeShape | undefined) => {
    this.setState(prevState => {
      const newPresent = query;
      return {
        queryHistory: {
          past: [
            ...prevState.queryHistory.past,
            prevState.queryHistory.present,
          ],
          present: newPresent,
          future: [],
        },
        staleCounters: true,
      };
    });
  };

  handleUndo = () => {
    this.setState(prevState => {
      const { queryHistory: { past, present, future } } = prevState;
      const previous = past[past.length - 1];
      const newPast = past.slice(0, past.length - 1);
      return {
        queryHistory: {
          past: newPast,
          present: previous,
          future: [present!, ...future],
        },
        staleCounters: true,
      };
    });
  };

  handleRedo = () => {
    this.setState(prevState => {
      const { queryHistory: { past, present, future } } = prevState;
      const next = future[0];
      const newFuture = future.slice(1);
      return {
        queryHistory: {
          past: [...past, present!],
          present: next,
          future: newFuture,
        },
        staleCounters: true,
      };
    });
  };

  render() {
    const { actionbarProps, onClose, onSave } = this.props;
    const {
      loading,
      objectTypes,
      queryHistory: { present: query },
      staleCounters,
    } = this.state;

    if (loading) {
      return <Loading className="loading-full-screen" />;
    }

    const enableUndo = this.state.queryHistory.past.length > 0;
    const enableRedo = this.state.queryHistory.future.length > 0;

    const handleOnClose = () => {
      if (onClose) onClose();
    };

    const handleOnSave = () => {
      if (onSave) onSave(query!);
    }

    const handleReload = () => {
      this.setState({ staleCounters: false })
    }

    return (
      <Layout className={actionbarProps.edition ? 'edit-layout' : ''}>
        <ActionBar {...actionbarProps}>
          <Button disabled={!query} className="mcs-primary" type="primary" onClick={handleOnSave}>
            <FormattedMessage
              id="query-builder-page-actionbar-save"
              defaultMessage="Save"
            />
          </Button>
          {onClose && (
            <McsIcon
              type="close"
              className="close-icon"
              style={{ cursor: 'pointer' }}
              onClick={handleOnClose}
            />
          )}
        </ActionBar>
        <Layout.Content
          className={`mcs-content-container ${actionbarProps.edition ? 'flex' : ''}` }
          style={{ padding: 0 }}
        >
          <JSONQLBuilder
            objectTypes={objectTypes}
            query={query}
            updateQuery={this.handleUpdateQuery}
            undoRedo={{
              enableUndo: enableUndo,
              enableRedo: enableRedo,
              handleUndo: this.handleUndo,
              handleRedo: this.handleRedo
            }}
            edition={actionbarProps.edition}
            handleRefreshValue={handleReload}
            shouldReloadQuery={staleCounters}
          />
        </Layout.Content>
      </Layout>
    );
  }
}

export default compose<Props, JSONQLBuilderContainerProps>(
  injectIntl,
  injectNotifications,
  connect(state => ({
    getWorkspace: SessionHelper.getWorkspace,
  })),
)(JSONQLBuilderContainer);
