// import * as React from 'react';
// import cuid from 'cuid';
// import {
//   OTQLAggregationResult,
//   isAggregateResult,
// } from '../../../../models/datamart/graphdb/OTQLResult';
// import injectThemeColors, {
//   InjectedThemeColorsProps,
// } from '../../../Helpers/injectThemeColors';
// import { compose } from 'recompose';
// import { ClusteredVerticalBarChart } from '../../../../components/BarCharts';
// import { LoadingChart, EmptyCharts } from '../../../../components/EmptyCharts';
// import { injectIntl, InjectedIntlProps } from 'react-intl';
// import messages from './messages';
// import { lazyInject } from '../../../../config/inversify.config';
// import { TYPES } from '../../../../constants/types';
// import { IQueryService } from '../../../../services/QueryService';
// import CardFlex from '../Components/CardFlex';

// export interface MapStackedBarChartProps {
//   title?: string;
//   clauseIds: string[];
//   queryId: string;
//   keys: string[];
//   datamartId: string;
//   height?: number;
//   labelsEnabled?: boolean;
// }

// interface QueryResult {
//   xKey: number | string;
//   [s: string]: number | string;
// }

// interface State {
//   queryResult?: QueryResult[];
//   colors: string[];
//   error: boolean;
//   loading: boolean;
// }

// type Props = MapStackedBarChartProps &
//   InjectedThemeColorsProps &
//   InjectedIntlProps;

// class MapStackedBarChart extends React.Component<Props, State> {
//   identifier = cuid();

//   @lazyInject(TYPES.IQueryService)
//   private _queryService: IQueryService;

//   constructor(props: Props) {
//     super(props);
//     const { colors } = props;
//     const usedColors: string[] = [
//       colors['mcs-warning'],
//       colors['mcs-info'],
//       colors['mcs-highlight'],
//       colors['mcs-success'],
//       colors['mcs-normal'],
//       colors['mcs-primary'],
//       colors['mcs-error'],
//     ];
//     this.state = {
//       error: false,
//       loading: true,
//       colors: usedColors,
//     };
//   }

//   componentDidMount() {
//     const { clauseIds, queryId, datamartId } = this.props;

//     this.fetchData(datamartId, queryId, clauseIds);
//   }

//   componentWillReceiveProps(nextProps: MapStackedBarChartProps) {
//     const { clauseIds, queryId, datamartId } = this.props;
//     const {
//       clauseIds: nextClauseIds,
//       queryId: nextQueryId,
//       datamartId: nextDatamartId,
//     } = nextProps;

//     if (
//       clauseIds !== nextClauseIds ||
//       datamartId !== nextDatamartId ||
//       queryId !== nextQueryId
//     ) {
//       this.fetchData(nextDatamartId, nextQueryId, nextClauseIds);
//     }
//   }

//   formatData = (queryResult: OTQLAggregationResult[][]): QueryResult[] => {
//     const { keys } = this.props;
//     const unFormattedResults: Array<
//       Array<{
//         keyName: string | number;
//         yKey: string | number;
//         xKey: string | number;
//       }>
//     > = queryResult.map((qr, i) => {
//       if (
//         qr.length &&
//         qr[0].aggregations.buckets.length &&
//         qr[0].aggregations.buckets[0].buckets.length
//       ) {
//         return qr[0].aggregations.buckets[0].buckets.map(data => ({
//           keyName: keys[i],
//           yKey: data.count,
//           xKey: data.key,
//         }));
//       }
//       return [];
//     });
//     let formattedResults: Array<{
//       keyName: string | number;
//       yKey: string | number;
//       xKey: string | number;
//     }> = [];

//     unFormattedResults.forEach(
//       ufr => (formattedResults = [...formattedResults, ...ufr]),
//     );
//     const scale = [...new Set(formattedResults.map(s => s.xKey))];
//     const results = scale.map(s => {
//       const allValues = formattedResults
//         .filter(ufr => ufr.xKey === s)
//         .reduce(
//           (acc, val, i) => {
//             return {
//               ...acc,
//               [val.keyName]: val.yKey,
//               xKey: s,
//             };
//           }, // tslint:disable-next-line: no-object-literal-type-assertion
//           {} as QueryResult,
//         );
//       return allValues;
//     });
//     return results;
//   };

//   fetchData = (
//     datamartId: string,
//     queryId: string,
//     clauseIds: string[],
//   ): Promise<void> => {
//     this.setState({ error: false, loading: true });

//     return this._queryService
//       .getQuery(datamartId, queryId)
//       .then(res => {
//         if (res.data.query_language === 'OTQL' && res.data.query_text) {
//           return Promise.all(
//             clauseIds.map(clauseId => {
//               return this._queryService.getWhereClause(datamartId, clauseId);
//             }),
//           )
//             .then(clauseRespList => {
//               return clauseRespList.map(crl => crl.data);
//             })
//             .then(clauseList => {
//               return Promise.all(
//                 clauseList.map(clause => {
//                   const query = {
//                     query: res.data.query_text,
//                     additional_expression: clause,
//                   };
//                   return this._queryService.runOTQLQuery(
//                     datamartId,
//                     JSON.stringify(query),
//                     {
//                       use_cache: true,
//                       content_type: `application/json`,
//                     },
//                   );
//                 }),
//               );
//             })
//             .then(otqlResultListResp => {
//               return otqlResultListResp.map(
//                 otqlResultResp => otqlResultResp.data,
//               );
//             })
//             .then(otqlResultList => {
//               const result = otqlResultList.map(r => {
//                 if (!isAggregateResult(r.rows)) {
//                   throw new Error('wrong query type');
//                 }
//                 return r.rows;
//               });
//               this.setState({
//                 queryResult: this.formatData(
//                   result as OTQLAggregationResult[][],
//                 ),
//                 loading: false,
//               });
//               return Promise.resolve();
//             })
//             .catch(e => this.setState({ error: true, loading: false }));
//         }

//         const err = new Error('wrong query language');
//         return Promise.reject(err);
//       })

//       .catch(() => {
//         // TO REMOVE :
//         this.setState({
//           error: false,
//           loading: false,
//           queryResult: [
//             { xKey: '0', yKey1: 2 },
//             { xKey: '1', yKey1: 4 },
//             { xKey: '2', yKey1: 6 },
//             { xKey: '3', yKey1: 3 },
//             { xKey: '4', yKey1: 1 },
//           ],
//         });
//       });
//   };

//   generateOptions = () => {
//     const options = {
//       innerRadius: true,
//       isHalf: false,
//       text: {},
//       colors: this.state.colors,
//       showTooltip: true,
//     };
//     return options;
//   };

//   public render() {
//     const { title, colors, intl, height, keys } = this.props;

//     const optionsForChart = {
//       xKey: 'xKey',
//       yKeys: keys,
//       colors: [colors['mcs-info'], colors['mcs-success']],
//       labelsEnabled: this.props.labelsEnabled,
//     };

//     const generateChart = () => {
//       if (this.state.loading) {
//         return <LoadingChart />;
//       } else if (this.state.error) {
//         return (
//           <EmptyCharts
//             title={intl.formatMessage(messages.error)}
//             icon={'close-big'}
//           />
//         );
//       } else if (
//         (this.state.queryResult && this.state.queryResult.length === 0) ||
//         !this.state.queryResult
//       ) {
//         return <EmptyCharts title={intl.formatMessage(messages.noData)} icon='warning' />;
//       } else {
//         return (
//           <ClusteredVerticalBarChart
//             identifier={`${this.identifier}-chart`}
//             dataset={this.state.queryResult}
//             options={optionsForChart}
//             colors={{ base: colors['mcs-info'], hover: colors['mcs-warning'] }}
//             height={height}
//           />
//         );
//       }
//     };

//     return <CardFlex title={title}>{generateChart()}</CardFlex>;
//   }
// }

// export default compose<Props, MapStackedBarChartProps>(
//   injectThemeColors,
//   injectIntl,
// )(MapStackedBarChart);
