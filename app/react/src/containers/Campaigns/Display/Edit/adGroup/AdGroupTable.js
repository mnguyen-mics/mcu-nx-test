import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Table } from 'antd';
import { Field, FieldArray, FormSection } from 'redux-form';

import { ButtonStyleless, Form, McsIcons } from '../../../../../components';
import generateGuid from '../../../../../utils/generateGuid';

const { SwitchInput } = Form;

function AdGroupTableWrapper({ segments, tableName }) {

  class AdGroupTable extends Component {
    // componentDidMount() {
    //   this.populateFields();
    // }

    // populateFields = () => {
    //   const { fields } = this.props;
    //   let fieldValues = this.props.fields.getAll();
    //   const segmentIds = segments.map(segment => segment.audience_segment_id);
    //
    //   segments.forEach(elem => {
    //     if (!fields.length || !fieldValues.find(field => field.id === elem.audience_segment_id)) {
    //       const { audience_segment_id, name, ...other } = elem;
    //
    //       fields.push({
    //         id: audience_segment_id,
    //         name: audience_segment_id,
    //         text: name,
    //         ...other,
    //       });
    //     }
    //   });
    //
    //   fieldValues = this.props.fields.getAll();
    //
    //   if (fields.length) {
    //     fieldValues.forEach((field, index) => {
    //       if (!segmentIds.includes(field.id)) {
    //         fields.remove(index);
    //       }
    //     });
    //   }
    // }

    render() {

      // const columns = [
      //   {
      //     colSpan: 8,
      //     dataIndex: 'type',
      //     key: 'type',
      //     render: (type) => (
      //       <div className="display-row center-vertically row-height">
      //         <div className="icon-round-border">
      //           <McsIcons
      //             type={type.image}
      //             style={{ color: '#00a1df', fontSize: 24, margin: 'auto' }}
      //           />
      //         </div>
      //         {type.text}
      //       </div>
      // ),
      //   },
      //   {
      //     colSpan: 6,
      //     dataIndex: 'data',
      //     key: 'data',
      //     render: (data) => {
      //       const elemToDisplay = (elem) => (elem.image
      //     ? (
      //       <div className="display-row" key={generateGuid()}>
      //         <McsIcons type={elem.image} style={{ fontSize: 20 }} />
      //         <p>{elem.text}</p>
      //       </div>
      //     )
      //     : <p key={generateGuid()}>{elem}</p>
      //   );
      //
      //       return (
      //         <div className="display-row data-content row-height">
      //           {data.map(elem => elemToDisplay(elem))}
      //         </div>
      //       );
      //     },
      //   },
      //   {
      //     colSpan: 9,
      //     dataIndex: 'switchButton',
      //     key: 'switchButton',
      //     render: (data) => {
      //       console.log('data = ', data);
      //
      //       return (
      //         <div>
      //           {data && data.id
      //           ? (
      //             <div className="display-row align-left">
      //               <Field
      //                 component={SwitchInput}
      //                 name={`${data.id}.switch`}
      //                 type="checkbox"
      //               />
      //
      //               <p className="switch-title-padding">
      //                 {true ? 'Target' : 'Exclude'}
      //               </p>
      //             </div>
      //           )
      //           : null
      //         }
      //         </div>
      //       );
      //     },
      //   },
      //   {
      //     colSpan: 1,
      //     dataIndex: 'deleteButton',
      //     key: 'deleteButton',
      //     render: (bool) => (
      //       <ButtonStyleless>
      //         <McsIcons type="delete" style={{ fontSize: 20 }} />
      //       </ButtonStyleless>
      // ),
      //   },
      // ];
      //
      // const dataSourceWithKeys = dataSource.map(data => ({
      //   ...data,
      //   key: generateGuid(),
      // }));

      return (
        <div className="adGroup-table">
          <Table
            className="border-style"
            dataSource={[/* dataSourceWithKeys */]}
            columns={[/* columns */]}
            pagination={false}
            showHeader={false}
          />
        </div>
      );
    }
  }

  AdGroupTable.defaultProps = {
    // fields: [],
  };

  AdGroupTable.propTypes = {
    fields: PropTypes.shape().isRequired,
  };

  return <FieldArray name={tableName} component={AdGroupTable} />;
}

AdGroupTableWrapper.propTypes = {
  segments: PropTypes.arrayOf(PropTypes.shape().isRequired).isRequired,
  tableName: PropTypes.string.isRequired,
};


export default AdGroupTableWrapper;
