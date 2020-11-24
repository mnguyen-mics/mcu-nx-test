import * as React from 'react';
import _ from 'lodash';
import { compose } from 'recompose';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import { messages } from '../../messages';
import { FormSection } from '../../../../../../components/Form';
import {
  SchemaItem,
  Field,
  isSchemaItem,
} from '../../../../../QueryTool/JSONOTQL/domain';
import { Card } from '@mediarithmics-private/mcs-components-library';
import AudienceFeatureVariable from '../../../../../Audience/AudienceBuilder/QueryFragmentBuilders/AudienceFeatureVariable';
import { withRouter, RouteComponentProps } from 'react-router';
import {
  AudienceFeatureVariableResource,
  AudienceFeatureType,
} from '../../../../../../models/audienceFeature';
import { AudienceFeatureFormData } from '../domain';

interface AudienceFeaturePreviewProps {
  schema?: SchemaItem;
  formValues: AudienceFeatureFormData;
}

interface State {
  variables: AudienceFeatureVariableResource[];
}

type Props = AudienceFeaturePreviewProps &
  InjectedIntlProps &
  RouteComponentProps<{ datamartId: string }>;

class AudienceFeaturePreview extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { variables: [] };
  }

  componentDidUpdate(prevProps: Props) {
    const {
      formValues: { object_tree_expression: prevObjectTreeExpression },
      schema: prevSchema,
    } = prevProps;
    const {
      formValues: { object_tree_expression },
      schema,
    } = this.props;
    if (
      (object_tree_expression !== prevObjectTreeExpression ||
        !_.isEqual(schema, prevSchema)) &&
      object_tree_expression &&
      schema
    ) {
      this.setState({
        variables: this.extractVariables(object_tree_expression, schema),
      });
    }
  }

  extractVariables = (query: string, schema: SchemaItem) => {
    const matchType = (type: any) => {
      switch (type) {
        case 'ID':
        case 'ID!':
        case 'Number':
        case 'Number!':
          return 'Int';
        case 'Bool':
        case 'Bool!':
          return 'Boolean';
        case 'Timestamp':
        case 'Timestamp!':
        case 'Date':
        case 'Date!':
          return 'Date';
        case 'String':
        case 'String!':
          return 'String';
        case 'Enum':
        case 'Enum!':
        case 'List':
        case 'List!':
          return 'Enum';
        case 'OperatingSystemFamily':
          return 'OperatingSystemFamily';
        case 'FormFactor':
          return 'FormFactor';
        case 'HashFunction':
          return 'HashFunction';
        case 'BrowserFamily':
          return 'BrowserFamily';
        case 'UserAgentType':
          return 'UserAgentType';
        case 'ActivitySource':
          return 'ActivitySource';
        case 'UserActivityType':
          return 'UserActivityType';

        default:
          return null;
      }
    };
    const variables: AudienceFeatureVariableResource[] = [];
    const loop = (fields: Field[]) => {
      fields.forEach(field => {
        if (isSchemaItem(field)) {
          loop(field.fields);
        } else {
          variables.push({
            parameter_name: field.name,
            field_name: field.name,
            type: matchType(field.field_type),
            path: [],
          });
        }
      });
    };
    loop(schema.fields);

    // Split the query on <, <=, >, >=, = or == and remove last one
    const queryElements = query.split(/[<>]=?|==|=/);
    queryElements.splice(queryElements.length - 1);
    const fieldNames = queryElements.map(el => {
      // we remove leading/trailing spaces and
      // we keep only the last word before the operator
      const fieldName = el
        .trim()
        .split(' ')
        .pop()!;
      return fieldName;
    });

    return fieldNames.map(fieldName => {
      return {
        parameter_name: `${fieldName} parameter`,
        field_name: fieldName,
        type: matchType(
          variables.find(v => v.field_name === fieldName)?.type || null,
        ) as AudienceFeatureType,
        path: [],
      };
    });
  };

  render() {
    const {
      intl: { formatMessage },
      match: {
        params: { datamartId },
      },
      formValues,
    } = this.props;

    const { variables } = this.state;

    return (
      <div className="mcs-audienceFeature-preview">
        <FormSection title={messages.preview} />
        <Card
          className="mcs-audienceFeature_card"
          title={formatMessage(messages.audienceFeatures)}
        >
          <div className="mcs-audienceFeature_cardContainer">
            <div className="mcs-audienceFeature_name">{formValues.name}</div>
            <i className="mcs-audienceFeature_description">
              {formValues.description}
            </i>
            {variables.map((v, index) => {
              return (
                <AudienceFeatureVariable
                  key={index}
                  disabled={true}
                  datamartId={datamartId}
                  variable={v}
                  objectTypes={[]}
                  formPath={''}
                />
              );
            })}
          </div>
        </Card>
      </div>
    );
  }
}

export default compose<Props, AudienceFeaturePreviewProps>(
  injectIntl,
  withRouter,
)(AudienceFeaturePreview);
