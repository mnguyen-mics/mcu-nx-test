import * as React from 'react';
import { compose } from 'recompose';
import { Layout } from 'antd';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { connect } from 'react-redux';
import JSONQLBuilder, { QueryResult } from './JSONQLBuilder';
import {
  ObjectTreeExpressionNodeShape,
  QueryDocument,
  SelectionField,
} from '../../../models/datamart/graphdb/QueryDocument';
import { ObjectLikeTypeInfoResource } from '../../../models/datamart/graphdb/RuntimeSchema';
import { Loading } from '../../../components';
import * as SessionHelper from '../../../redux/Session/selectors';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../Notifications/injectNotifications';
import { RouteComponentProps, withRouter } from 'react-router';
import { computeFinalSchemaItem, computeSchemaPathFromQueryPath, SchemaItem, FieldProposalLookup } from './domain';
import { JSONQLBuilderContext } from './JSONQLBuilderContext';
import { lazyInject } from '../../../config/inversify.config';
import { TYPES } from '../../../constants/types';
import { IQueryService } from '../../../services/QueryService';
import { isAggregateResult } from '../../../models/datamart/graphdb/OTQLResult';
import { injectFeatures, InjectedFeaturesProps } from '../../Features';
import { IRuntimeSchemaService } from '../../../services/RuntimeSchemaService';

export interface JSONQLBuilderContainerProps {
  datamartId: string;
  queryId?: string;
  queryDocument?: QueryDocument;
  renderActionBar: (
    queryDocument: QueryDocument,
    datamartId: string,
  ) => React.ReactNode;
  editionLayout?: boolean;
  isTrigger?: boolean;
}

interface State {
  fetchingObjectTypes: boolean;
  objectTypes: ObjectLikeTypeInfoResource[];
  queryHistory: {
    past: Array<ObjectTreeExpressionNodeShape | undefined>;
    present: ObjectTreeExpressionNodeShape | undefined;
    future: ObjectTreeExpressionNodeShape[];
  };
  queryResult: QueryResult;
  staleQueryResult: boolean;
}

type Props = JSONQLBuilderContainerProps &
  InjectedIntlProps &
  InjectedNotificationProps &
  RouteComponentProps<{ organisationId: string }> & InjectedFeaturesProps;


class JSONQLBuilderContainer extends React.Component<Props, State> {
  @lazyInject(TYPES.IQueryService)
  private _queryService: IQueryService;

  @lazyInject(TYPES.IRuntimeSchemaService)
  private _runtimeSchemaService: IRuntimeSchemaService;

  constructor(props: Props) {
    super(props);

    this.state = {
      fetchingObjectTypes: false,
      staleQueryResult: false,
      queryResult: {
        loading: false,
      },
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
    this.loadData(datamartId, queryId);
  }

  componentWillReceiveProps(nextProps: Props) {
    const { datamartId, queryId } = this.props;
    const { datamartId: nextDatamartId, queryId: nextQueryId } = nextProps;

    if (nextDatamartId !== datamartId || queryId !== nextQueryId) {
      this.loadData(nextDatamartId, nextQueryId);
    }
  }

  loadData(datamartId: string, queryId?: string) {
    this.setState({ fetchingObjectTypes: true });
    Promise.all([
      this.fetchObjectTypes(datamartId),
      queryId
        ? this._queryService.getQuery(datamartId, queryId).then(res => res.data)
        : Promise.resolve(null),
    ])
      .then(([objectTypes, eventualQuery]) => {
        this.setState(
          prevState => ({
            fetchingObjectTypes: false,
            objectTypes: objectTypes
              .map(oType => ({
                ...oType,
                fields: oType.fields.sort((fieldA, fieldB) =>
                  fieldA.name.localeCompare(fieldB.name),
                ),
              }))
              .sort((otypeA, oTypeB) => otypeA.name.localeCompare(oTypeB.name)),
            queryHistory: {
              past: [],
              present: this.props.queryDocument
                ? this.props.queryDocument.where
                : undefined,
              future: [],
            },
          }),
          () => {
            this.runQuery(datamartId);
          },
        );
      })
      .catch(err => {
        this.props.notifyError(err);
        this.setState({ fetchingObjectTypes: false });
      });
  }

  fetchObjectTypes = (
    datamartId: string,
  ): Promise<ObjectLikeTypeInfoResource[]> => {
    return this._runtimeSchemaService.getRuntimeSchemas(datamartId).then(
      schemaRes => {
        const liveSchema = schemaRes.data.find(s => s.status === 'LIVE');
        if (!liveSchema) return [];
        return this._runtimeSchemaService.getObjectTypeInfoResources(
          datamartId,
          liveSchema.id,
        );
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
        staleQueryResult: true,
        queryResult: {
          ...prevState.queryResult,
          error: undefined,
        },
      };
    });
  };

  handleUndo = () => {
    this.setState(prevState => {
      const {
        queryHistory: { past, present, future },
      } = prevState;
      const previous = past[past.length - 1];
      const newPast = past.slice(0, past.length - 1);
      return {
        queryHistory: {
          past: newPast,
          present: previous,
          future: [present!, ...future],
        },
        staleQueryResult: true,
        queryResult: {
          ...prevState.queryResult,
          error: undefined,
        },
      };
    });
  };

  handleRedo = () => {
    this.setState(prevState => {
      const {
        queryHistory: { past, present, future },
      } = prevState;
      const next = future[0];
      const newFuture = future.slice(1);
      return {
        queryHistory: {
          past: [...past, present!],
          present: next,
          future: newFuture,
        },
        staleQueryResult: true,
        queryResult: {
          ...prevState.queryResult,
          error: undefined,
        },
      };
    });
  };

  runFieldProposal: FieldProposalLookup = (treenodePath, fieldName) => {
    const {datamartId, isTrigger, hasFeature} = this.props;
    const {queryHistory: {present: query}, objectTypes} = this.state;

    if (!hasFeature('audience-segment_builder-reference_table')) {
      return Promise.resolve([]);
    }
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        
    const computedSchema = objectTypes.length
      ? computeFinalSchemaItem(
          objectTypes,
          'UserPoint',
          !isTrigger,
          isTrigger ? isTrigger : false,
        )
      : undefined;
    

    const computedSchemaPathFromQueryPath = computeSchemaPathFromQueryPath(
      query,
      treenodePath,
      computedSchema,
      fieldName
    );

    const computedSelectQuery = (path: number[], schema?: SchemaItem): SelectionField[] => {
      if (!schema) {
        throw new Error('please provide a schema');
      }
      if (path.length === 1) {
        const [currentP] = path;
        return [{ name: schema.fields[currentP].name, directives: [{ name: "map" }] }]
      }
      const [currentPath, ...remainingPaths] = path;
      const newSchema = schema.fields[currentPath] as SchemaItem;
      return [{ name: newSchema.name,selections: computedSelectQuery(remainingPaths, newSchema) }]
    }

    const computedOtqlSelectQuery = (path: number[], schema?: SchemaItem): string => {
      if (!schema) {
        throw new Error('please provide a schema');
      }
      if (path.length === 1) {
        const [currentP] = path;
        return `{ ${schema.fields[currentP].name} @map(limit:10000) }`
      }
      const [currentPath, ...remainingPaths] = path;
      const newSchema = schema.fields[currentPath] as SchemaItem;
      return `{ ${newSchema.name} ${computedOtqlSelectQuery(remainingPaths, newSchema)} }`
    }


    const otqlQuery = `SELECT ${computedOtqlSelectQuery(computedSchemaPathFromQueryPath, computedSchema)} FROM UserPoint`;

    return this._queryService.runOTQLQuery(
      datamartId,
      otqlQuery,
      { use_cache: true }
    ).then(d => {
      if (isAggregateResult(d.data.rows)) {
        return d.data.rows[0]
      } else {
        throw new Error('err')
      }
    })
    .then(d => {
      return d.aggregations.buckets[0]
    })
    .then(d => d.buckets.map(e => e.key))
    .catch(() => ([]))
  }

  handleCopy = (copying: ObjectTreeExpressionNodeShape) => {
    this.setState(prevState => {
      return {
        ...prevState,
        copyQuery: copying
      }
    })
  }


  runQuery = (_datamartId?: string) => {
    const { datamartId } = this.props;
    const queryDocument: QueryDocument = {
      operations: [{ directives: [{ name: 'count' }], selections: [] }],
      from: 'UserPoint',
      where: this.state.queryHistory.present,
    };
    this.setState({
      staleQueryResult: false,
      queryResult: {
        loading: true,
      },
    });
    this._queryService
      .runJSONOTQLQuery(datamartId, queryDocument)
      .then(res => {
        this.setState({
          queryResult: {
            loading: false,
            otqlResult: res.data,
          },
        });
      })
      .catch(error => {
        this.setState({
          queryResult: {
            loading: false,
            error,
          },
        });
      });
  };

  render() {
    const {
      editionLayout,
      renderActionBar,
      datamartId,
      match: {
        params: { organisationId },
      },
      isTrigger,
    } = this.props;
    const {
      fetchingObjectTypes,
      objectTypes,
      queryHistory: { present: query },
      queryResult,
      staleQueryResult,
    } = this.state;

    if (fetchingObjectTypes) {
      return <Loading className="loading-full-screen" />;
    }

    const enableUndo = this.state.queryHistory.past.length > 0;
    const enableRedo = this.state.queryHistory.future.length > 0;

    const computedSchema = objectTypes.length
      ? computeFinalSchemaItem(
          objectTypes,
          'UserPoint',
          !isTrigger,
          isTrigger ? isTrigger : false,
        )
      : undefined;

    return (
      <Layout className={editionLayout ? 'edit-layout' : ''}>
        {renderActionBar(
          {
            operations: [{ directives: [], selections: [{ name: 'id' }] }],
            from: 'UserPoint',
            where: query,
          },
          datamartId,
        )}
        <Layout.Content
          className={`mcs-content-container ${
            editionLayout ? 'flex-basic' : ''
          }`}
          style={{ padding: 0, overflow: 'hidden' }}
        >
          <JSONQLBuilderContext.Provider
            value={{
              query: query,
              schema: computedSchema,
              isTrigger: !!this.props.isTrigger,
              runFieldProposal: this.runFieldProposal
            }}
          >
            <JSONQLBuilder
              objectTypes={objectTypes}
              query={query}
              updateQuery={this.handleUpdateQuery}
              undoRedo={{
                enableUndo: enableUndo,
                enableRedo: enableRedo,
                handleUndo: this.handleUndo,
                handleRedo: this.handleRedo,
              }}
              edition={editionLayout}
              runQuery={this.runQuery}
              staleQueryResult={staleQueryResult}
              queryResult={queryResult}
              datamartId={this.props.datamartId}
              organisationId={organisationId}
            />
          </JSONQLBuilderContext.Provider>
        </Layout.Content>
      </Layout>
    );
  }
}

export default compose<Props, JSONQLBuilderContainerProps>(
  withRouter,
  injectIntl,
  injectNotifications,
  injectFeatures,
  connect(state => ({
    getWorkspace: SessionHelper.getWorkspace,
  })),
  
)(JSONQLBuilderContainer);
