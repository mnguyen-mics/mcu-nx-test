// import { ObjectTreeExpressionNodeShape } from '../../../models/datamart/graphdb/QueryDocument';
// import { ObjectLikeTypeInfoResource } from '../../../models/datamart/graphdb/RuntimeSchema';

// export const query: ObjectTreeExpressionNodeShape = {
//   type: 'GROUP',
//   boolean_operator: 'OR',
//   expressions: [
//     {
//       type: 'GROUP',
//       boolean_operator: 'AND',
//       expressions: [
//         {
//           type: 'OBJECT',
//           field: 'UserAgent',
//           boolean_operator: 'AND',
//           expressions: [],
//         },
//         {
//           type: 'OBJECT',
//           field: 'visit',
//           boolean_operator: 'AND',
//           negation: false,
//           expressions: [
//             {
//               type: 'FIELD',
//               field: 'date',
//               comparison: {
//                 type: 'TIME',
//                 operator: 'BEFORE',
//                 values: ['now-1d']
//               }
//             },
//             {
//               type: 'FIELD',
//               field: 'id',
//               comparison: {
//                 type: 'STRING',
//                 operator: 'EQ',
//                 values: ['12', '15', '14', '13'],
//               },
//             },
//             {
//               type: 'OBJECT',
//               field: 'event',
//               boolean_operator: 'AND',
//               expressions: [
//                 {
//                   type: 'FIELD',
//                   field: 'name',
//                   comparison: {
//                     type: 'STRING',
//                     operator: 'EQ',
//                     values: ['Vue produit'],
//                   },
//                 },
//                 {
//                   type: 'FIELD',
//                   field: 'products',
//                   comparison: {
//                     type: 'STRING',
//                     operator: 'EQ',
//                     values: ['Vue produit'],
//                   },
//                 },
//                 {
//                   type: 'OBJECT',
//                   field: 'event',
//                   boolean_operator: 'AND',
//                   expressions: [
//                     {
//                       type: 'FIELD',
//                       field: 'name',
//                       comparison: {
//                         type: 'STRING',
//                         operator: 'EQ',
//                         values: ['Vue produit'],
//                       },
//                     },
//                     {
//                       type: 'FIELD',
//                       field: 'products',
//                       comparison: {
//                         type: 'STRING',
//                         operator: 'EQ',
//                         values: ['Vue produit'],
//                       },
//                     },
//                   ],
//                 }
//               ],
//             },
//           ],
//         },
//         {
//           type: 'OBJECT',
//           field: 'profile',
//           boolean_operator: 'AND',
//           expressions: [
//             {
//               type: 'FIELD',
//               field: 'age',
//               comparison: {
//                 type: 'TIME',
//                 operator: 'BEFORE_OR_EQUAL',
//                 values: ['Sat Mar 31 2018 12:02:18 GMT+0200 (CEST)']
//               }
//             },
//           ],
//         },
//       ],
//     },
//     {
//       type: 'GROUP',
//       boolean_operator: 'AND',
//       negation: false,
//       expressions: [
//         {
//           type: 'OBJECT',
//           field: 'visit2',
//           boolean_operator: 'AND',
//           expressions: [
//             {
//               type: 'FIELD',
//               field: 'date2',
//               comparison: {
//                 type: 'STRING',
//                 operator: 'EQ',
//                 values: ['Vue produit'],
//               }
//             },
//             {
//               type: 'FIELD',
//               field: 'id2',
//               comparison: {
//                 type: 'STRING',
//                 operator: 'EQ',
//                 values: ['Vue produit'],
//               }
//             },

//             {
//               type: 'OBJECT',
//               field: 'event2',
//               boolean_operator: 'AND',
//               negation: true,
//               expressions: [
//                 {
//                   type: 'FIELD',
//                   field: 'event2_name2',
//                   comparison: {
//                     type: 'STRING',
//                     operator: 'EQ',
//                     values: ['Vue produit'],
//                   }
//                 },
//                 {
//                   type: 'FIELD',
//                   field: 'event2_id2',
//                   comparison: {
//                     type: 'STRING',
//                     operator: 'EQ',
//                     values: ['Vue produit'],
//                   }
//                 },
//               ],
//             },
//           ],
//         },
//       ],
//     },
//   ],
// };

// export const objectTypes: ObjectLikeTypeInfoResource[] = [
//   {
//     id: "310",
//     runtime_schema_id: "40",
//     type: "OBJECT_TYPE",
//     name: "UserPoint",
//     fields: [
//       {
//         id: "1988",
//         object_like_type_id: "310",
//         runtime_schema_id: "40",
//         field_type: "ID!",
//         name: "id"
//       },
//       {
//         id: "1991",
//         object_like_type_id: "310",
//         runtime_schema_id: "40",
//         field_type: "[UserAgent!]!",
//         name: "agents",
//       },
//       {
//         id: "1992",
//         object_like_type_id: "310",
//         runtime_schema_id: "40",
//         field_type: "[UserSegment!]!",
//         name: "segments",
//       },
//       {
//         id: "1989",
//         object_like_type_id: "310",
//         runtime_schema_id: "40",
//         field_type: "Timestamp!",
//         name: "creation_ts"
//       },
//       {
//         id: "1990",
//         object_like_type_id: "310",
//         runtime_schema_id: "40",
//         field_type: "Date!",
//         name: "creation_date"
//       }
//     ]
//   },
//   {
//     id: "311",
//     runtime_schema_id: "40",
//     type: "OBJECT_TYPE",
//     name: "UserAgent",
//     fields: [
//       {
//         "id": "1993",
//         "object_like_type_id": "311",
//         "runtime_schema_id": "40",
//         "field_type": "Bool!",
//         "name": "id"
//       },
//       {
//         "id": "1994",
//         "object_like_type_id": "311",
//         "runtime_schema_id": "40",
//         "field_type": "Timestamp!",
//         "name": "creation_ts"
//       },
//       {
//         "id": "1995",
//         "object_like_type_id": "311",
//         "runtime_schema_id": "40",
//         "field_type": "Date!",
//         "name": "creation_date"
//       }
//     ]
//   },
//   {
//     id: "312",
//     runtime_schema_id: "40",
//     type: "OBJECT_TYPE",
//     name: "UserSegment",
//     fields: [
//       {
//         "id": "1996",
//         "object_like_type_id": "312",
//         "runtime_schema_id": "40",
//         "field_type": "Number!",
//         "name": "id"
//       },
//       {
//         "id": "1997",
//         "object_like_type_id": "312",
//         "runtime_schema_id": "40",
//         "field_type": "Timestamp!",
//         "name": "creation_ts"
//       },
//       {
//         "id": "1998",
//         "object_like_type_id": "312",
//         "runtime_schema_id": "40",
//         "field_type": "Date!",
//         "name": "creation_date"
//       },
//       {
//         "id": "1999",
//         "object_like_type_id": "312",
//         "runtime_schema_id": "40",
//         "field_type": "Timestamp!",
//         "name": "last_modified_ts"
//       },
//       {
//         "id": "2000",
//         "object_like_type_id": "312",
//         "runtime_schema_id": "40",
//         "field_type": "Date!",
//         "name": "last_modified_date"
//       },
//       {
//         "id": "2001",
//         "object_like_type_id": "312",
//         "runtime_schema_id": "40",
//         "field_type": "Timestamp",
//         "name": "expiration_ts"
//       },
//       {
//         "id": "2002",
//         "object_like_type_id": "312",
//         "runtime_schema_id": "40",
//         "field_type": "Date!",
//         "name": "expiration_date"
//       }
//     ]
//   }
// ];
