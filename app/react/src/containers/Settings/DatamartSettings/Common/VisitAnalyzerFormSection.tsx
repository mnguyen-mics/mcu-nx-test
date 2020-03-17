import * as React from 'react';
import { WrappedFieldArrayProps } from 'redux-form';
import { InjectedIntlProps, injectIntl, defineMessages } from 'react-intl';
import cuid from 'cuid';
import { compose } from 'recompose';
import { injectDrawer } from '../../../../components/Drawer/index';
import { VisitAnalyzerFieldModel } from './domain';
import FormSection from '../../../../components/Form/FormSection';
import RelatedRecords from '../../../../components/RelatedRecord/RelatedRecords';
import RecordElement from '../../../../components/RelatedRecord/RecordElement';
import VisitAnalyzerSelector, {
  VisitAnalyzerSelectorProps,
} from '../Common/VisitAnalyzerSelector';
import { VisitAnalyzer } from '../../../../models/Plugins';
import {
  PropertyResourceShape,
  StringPropertyResource,
} from '../../../../models/plugin/index';
import { ReduxFormChangeProps } from '../../../../utils/FormHelper';
import {
  DataResponse,
  DataListResponse,
} from '../../../../services/ApiService';
import { makeCancelable, CancelablePromise } from '../../../../utils/ApiHelper';
import { InjectedDrawerProps } from '../../../../components/Drawer/injectDrawer';
import { lazyInject } from '../../../../config/inversify.config';
import { IVisitAnalyzerService } from '../../../../services/Library/VisitAnalyzerService';
import { TYPES } from '../../../../constants/types';

export interface VisitAnalyzerSectionProps extends ReduxFormChangeProps {}

type Props = VisitAnalyzerSectionProps &
  WrappedFieldArrayProps<VisitAnalyzerFieldModel> &
  InjectedIntlProps &
  InjectedDrawerProps;

interface State {
  visitAnalyzerData: {
    visitAnalyzer?: VisitAnalyzer;
    properties: PropertyResourceShape[];
  };
}

const messages = defineMessages({
  dropdownAddExisting: {
    id: 'settings.form.activityAnalyzer.addExisting',
    defaultMessage: 'Add Existing',
  },
  sectionSubtitleVisitAnalyzer: {
    id: 'settings.form.activityAnalyzer.subtitle',
    defaultMessage:
      'Add a Visit Analyzer to your property. A Visit Analyzer is a custom plugin that helps you enhance or modify data before storing it in your DMP.',
  },
  sectionTitleVisitAnalyzer: {
    id: 'settings.form.activityAnalyzer.title',
    defaultMessage: 'Visit Analyzer',
  },
  sectionEmptyVisitAnalyzer: {
    id: 'settings.form.activityAnalyzer.empty',
    defaultMessage: 'There is no Visit Analyzer selected yet!',
  },
});

class VisitAnalyzerSection extends React.Component<Props, State> {
  cancelablePromise: CancelablePromise<
    [DataResponse<VisitAnalyzer>, DataListResponse<PropertyResourceShape>]
  >;

  @lazyInject(TYPES.IVisitAnalyzerService)
  private _visitAnalyzerService: IVisitAnalyzerService;

  constructor(props: Props) {
    super(props);
    this.state = {
      visitAnalyzerData: {
        properties: [],
      },
    };
  }

  componentDidMount() {
    const visitAnalyzerField = this.props.fields.getAll()[0];
    if (visitAnalyzerField)
      this.fetchActivityAnalyzer(
        visitAnalyzerField.model.visit_analyzer_model_id,
      );
  }

  componentWillReceiveProps(nextProps: Props) {
    const visitAnalyzerField = nextProps.fields.getAll()[0];
    if (visitAnalyzerField)
      this.fetchActivityAnalyzer(
        visitAnalyzerField.model.visit_analyzer_model_id,
      );
  }

  componentWillUnmount() {
    if (this.cancelablePromise) this.cancelablePromise.cancel();
  }

  fetchActivityAnalyzer = (visitAnalyzerId: string) => {
    this.cancelablePromise = makeCancelable(
      Promise.all([
        this._visitAnalyzerService.getInstanceById(visitAnalyzerId),
        this._visitAnalyzerService.getInstanceProperties(visitAnalyzerId),
      ]),
    );

    this.cancelablePromise.promise.then(results => {
      this.setState({
        visitAnalyzerData: {
          visitAnalyzer: results[0].data,
          properties: results[1].data,
        },
      });
    });
  };

  updateActivityAnalyzer = (visitAnalyzer: VisitAnalyzer[]) => {
    const { fields, formChange } = this.props;

    const newField: VisitAnalyzerFieldModel[] = [
      {
        key: cuid(),
        model: { visit_analyzer_model_id: visitAnalyzer[0].id },
      },
    ];

    formChange((fields as any).name, newField);
    this.props.closeNextDrawer();
  };

  openActivityAnalyzerSelector = () => {
    const { fields } = this.props;

    const selectedVisitAnalyzerIds = fields
      .getAll()
      .map(p => p.model.visit_analyzer_model_id);

    const props: VisitAnalyzerSelectorProps = {
      selectedVisitAnalyzerIds,
      close: this.props.closeNextDrawer,
      save: this.updateActivityAnalyzer,
    };

    this.props.openNextDrawer<VisitAnalyzerSelectorProps>(
      VisitAnalyzerSelector,
      {
        additionalProps: props,
      },
    );
  };

  getActivityAnalyzerRecords = () => {
    const { fields } = this.props;
    const { visitAnalyzerData } = this.state;

    const getName = (field: VisitAnalyzerFieldModel) => {
      const name =
        visitAnalyzerData.visitAnalyzer && visitAnalyzerData.visitAnalyzer.name;
      const typeP = visitAnalyzerData.properties.find(
        p => p.technical_name === 'name',
      );
      const providerP = visitAnalyzerData.properties.find(
        p => p.technical_name === 'provider',
      );

      if (name && typeP && providerP) {
        return `${name} (${(typeP as StringPropertyResource).value.value} - ${
          (providerP as StringPropertyResource).value.value
        })`;
      }

      return field.model.visit_analyzer_model_id;
    };

    return fields.map((name, index) => {
      const removeField = () => fields.remove(index);

      const field = fields.get(index);

      return (
        <RecordElement
          key={field.key}
          recordIconType="optimization"
          record={field}
          title={getName}
          onRemove={removeField}
        />
      );
    });
  };

  render() {
    const {
      intl: { formatMessage },
    } = this.props;

    return (
      <div>
        <FormSection
          dropdownItems={[
            {
              id: messages.dropdownAddExisting.id,
              message: messages.dropdownAddExisting,
              onClick: this.openActivityAnalyzerSelector,
            },
          ]}
          subtitle={messages.sectionSubtitleVisitAnalyzer}
          title={messages.sectionTitleVisitAnalyzer}
        />

        <RelatedRecords
          emptyOption={{
            iconType: 'optimization',
            message: formatMessage(messages.sectionEmptyVisitAnalyzer),
          }}
        >
          {this.getActivityAnalyzerRecords()}
        </RelatedRecords>
      </div>
    );
  }
}

export default compose<VisitAnalyzerSectionProps, Props>(
  injectIntl,
  injectDrawer,
)(VisitAnalyzerSection);
