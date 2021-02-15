import * as React from 'react';
import { ObjectLikeTypeInfoResource } from '../../../../../../models/datamart/graphdb/RuntimeSchema';
import { Button } from 'antd';
import { Form } from '@ant-design/compatible';
import {
  ConfigProps,
  reduxForm,
  InjectedFormProps,
} from 'redux-form';
import { FieldNodeFormDataValues } from '../../domain';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { withRouter, RouteComponentProps } from 'react-router';
import { compose } from 'recompose';
import FieldNodeForm from './FieldNodeForm';
import { FieldProposalLookup } from '../../../domain';
import { Path } from '@mediarithmics-private/mcs-components-library/lib/components/action-bar/Actionbar';

export interface FieldNodeFormWrapperProps
  extends ConfigProps<FieldNodeFormDataValues> {
  breadCrumbPaths: Path[];
  objectType: ObjectLikeTypeInfoResource;
  objectTypes: ObjectLikeTypeInfoResource[];
  idToAttachDropDowns?: string;
  runtimeSchemaId: string;
  datamartId: string;
  runFieldProposal?: FieldProposalLookup
  treeNodePath?: number[];
  isEdge: boolean
}

type Props = InjectedFormProps<
  FieldNodeFormDataValues,
  FieldNodeFormWrapperProps
> &
  FieldNodeFormWrapperProps &
  InjectedIntlProps &
  RouteComponentProps<{ organisationId: string }>;


class FieldNodeFormWrapper extends React.Component<Props, any> {
  // /**
  //  * Same a getQueryableObjectTypes but for scalar types
  //  */
  getQueryableFields = () => {
    const { objectTypes, objectType, isEdge } = this.props;

    return objectType.fields.filter(
      f =>
        !objectTypes.find(ot => {
          const match = f.field_type.match(/\w+/);
          return !!(match && match[0] === ot.name);
        }) && f.directives.find(dir => dir.name === 'TreeIndex') && (isEdge ? f.directives.find(dir => dir.name === 'EdgeAvailability') : true),
    );
  };

  render() {
    const { handleSubmit, change, objectType, idToAttachDropDowns, datamartId, runtimeSchemaId, treeNodePath, runFieldProposal, isEdge } = this.props;
    return (
      <Form
        className="edit-layout ant-layout"
        onSubmit={handleSubmit}
        layout="vertical"
      >
        <FieldNodeForm
          availableFields={this.getQueryableFields()}
          formChange={change}
          objectType={objectType}
          name={'fieldNodeForm'}
          idToAttachDropDowns={idToAttachDropDowns}
          datamartId={datamartId}
          runtimeSchemaId={runtimeSchemaId}
          formName={this.props.form}
          treeNodePath={treeNodePath}
          runFieldProposal={runFieldProposal}
          isEdge={isEdge}
        />
        <Button type="primary" className="mcs-primary" htmlType="submit">Submit</Button>
      </Form>
    );
  }
}

export default compose<Props, FieldNodeFormWrapperProps>(
  injectIntl,
  withRouter,
  reduxForm({
    enableReinitialize: true,
  }),
)(FieldNodeFormWrapper);
