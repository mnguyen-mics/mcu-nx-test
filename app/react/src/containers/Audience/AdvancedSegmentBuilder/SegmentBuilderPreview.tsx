import * as React from 'react';
import { TYPES } from '../../../constants/types';
import { QueryDocument as GraphdbQueryDocument } from '../../../models/datamart/graphdb/QueryDocument';
import { injectIntl, WrappedComponentProps, FormattedMessage } from 'react-intl';
import { compose } from 'recompose';
import { Button, Alert } from 'antd';
import { injectDrawer } from '../../../components/Drawer';
import { InjectedDrawerProps } from '../../../components/Drawer/injectDrawer';
import AdvancedSegmentBuilderContainer, {
  AdvancedSegmentBuilderContainerProps,
} from './AdvancedSegmentBuilderContainer';
import { messages } from './messages';
import { Actionbar, McsIcon } from '@mediarithmics-private/mcs-components-library';
import { IStandardSegmentBuilderQueryService } from '../StandardSegmentBuilder/StandardSegmentBuilderQueryService';
import { lazyInject } from '../../../config/inversify.config';
import { StandardSegmentBuilderQueryDocument } from '../../../models/standardSegmentBuilder/StandardSegmentBuilderResource';
import { UserQuerySegmentEditor } from '../../../models/audiencesegment/AudienceSegmentResource';
import StandardSegmentBuilderPreview, {
  StandardSegmentBuilderPreviewProps,
} from '../StandardSegmentBuilder/StandardSegmentBuilderPreview';
import Convert2Otql from '../../QueryTool/SaveAs/Convet2Otql';
import { QueryTranslationRequest } from '../../../models/datamart/DatamartResource';
import { IQueryService } from '../../../services/QueryService';

export type JSONQLPreviewContext = 'GOALS' | 'AUTOMATION_BUILDER';
export interface SegmentBuilderPreviewProps {
  value?: string | void;
  queryHasChanged?: boolean;
  onChange?: (e: string) => void;
  datamartId: string;
  context: JSONQLPreviewContext;
  isTrigger?: boolean;
  isEdge?: boolean;
  segmentEditor?: UserQuerySegmentEditor;
}

type Props = SegmentBuilderPreviewProps & WrappedComponentProps & InjectedDrawerProps;

interface State {
  conversionModalVisible: boolean;
  currentQuery: string;
}

class SegmentBuilderPreview extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      conversionModalVisible: false,
      currentQuery: '',
    };
  }

  @lazyInject(TYPES.IStandardSegmentBuilderQueryService)
  private _standardSegmentBuilderQueryService: IStandardSegmentBuilderQueryService;
  @lazyInject(TYPES.IQueryService)
  private _queryService: IQueryService;

  openEditor = () => {
    const { intl, value, segmentEditor, datamartId } = this.props;

    const openConversionModal = (query: any) => () => {
      this.setState({
        conversionModalVisible: true,
        currentQuery: JSON.stringify(query),
      });
    };

    const createActionBar = (onSave: () => void, onClose: () => void, query: any) => {
      return (
        <Actionbar
          edition={true}
          pathItems={[
            intl.formatMessage({
              id: 'jsonql.querytool.query.edit',
              defaultMessage: 'Edit Your Query',
            }),
          ]}
        >
          <Button
            disabled={!query}
            className='mcs-primary mcs-actionBar_updateQueryButton'
            type='primary'
            onClick={onSave}
          >
            <FormattedMessage
              id='queryTool.jsonql.querytool.query.edit.update'
              defaultMessage='Update'
            />
          </Button>
          <Button onClick={openConversionModal(query)}>
            <FormattedMessage
              id='form.layout.queryTool.query-builder.actionbar.convert'
              defaultMessage='Convert to OTQL'
            />
          </Button>
          <McsIcon
            type='close'
            className='close-icon'
            style={{ cursor: 'pointer' }}
            onClick={onClose}
          />
        </Actionbar>
      );
    };

    if (segmentEditor === 'STANDARD_SEGMENT_BUILDER') {
      const onClose = () => this.props.closeNextDrawer();
      const actionbar = (query: StandardSegmentBuilderQueryDocument) => {
        const onSave = () => {
          if (this.props.onChange) this.props.onChange(JSON.stringify(query));
          this.props.closeNextDrawer();
        };
        return createActionBar(onSave, onClose, query);
      };

      const jsonParsedValue = value && JSON.parse(value);

      const whereExpressionsFromValue = jsonParsedValue?.where?.expressions
        ? jsonParsedValue.where.expressions
        : [];

      return this.props.openNextDrawer<StandardSegmentBuilderPreviewProps>(
        StandardSegmentBuilderPreview,
        {
          additionalProps: {
            renderActionBar: actionbar,
            datamartId: datamartId,
            initialValues: jsonParsedValue
              ? this._standardSegmentBuilderQueryService.generateStandardSegmentBuilderFormData(
                  whereExpressionsFromValue,
                )
              : undefined,
            handleClose: onClose,
          },
        },
      );
    } else {
      const actionbar = (query: GraphdbQueryDocument) => {
        const onSave = () => {
          if (this.props.onChange) this.props.onChange(JSON.stringify(query));
          this.props.closeNextDrawer();
        };
        const onClose = () => this.props.closeNextDrawer();
        return createActionBar(onSave, onClose, query);
      };

      this.props.openNextDrawer<AdvancedSegmentBuilderContainerProps>(
        AdvancedSegmentBuilderContainer,
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
    }
  };

  render() {
    const { context, queryHasChanged, intl, datamartId, segmentEditor } = this.props;

    const closeConversionModal = () => this.setState({ conversionModalVisible: false });

    const query = this.state.currentQuery;
    const convert2Otql = () => {
      const queryTranslationRequest: QueryTranslationRequest = {
        input_query_language: 'JSON_OTQL',
        input_query_language_subtype:
          segmentEditor === 'STANDARD_SEGMENT_BUILDER' ? 'PARAMETRIC' : undefined,
        input_query_text: query,
        output_query_language: 'OTQL',
      };
      return this._queryService.translateQuery(datamartId, queryTranslationRequest);
    };

    return (
      <div>
        {context === 'AUTOMATION_BUILDER' ? (
          <div onClick={this.openEditor} className='boolean-menu-item'>
            {this.props.intl.formatMessage({
              id: 'jsonql.button.query.edit',
              defaultMessage: 'Edit Query',
            })}
          </div>
        ) : (
          <div className='text-center m-t-20'>
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
            <Button
              className='mcs-editAudienceSegmentForm_editQueryButton'
              onClick={this.openEditor}
            >
              {this.props.intl.formatMessage({
                id: 'jsonql.button.query.edit',
                defaultMessage: 'Edit Query',
              })}
            </Button>
          </div>
        )}
        {this.state.conversionModalVisible && (
          <Convert2Otql
            onOk={closeConversionModal}
            onCancel={closeConversionModal}
            footer={null}
            visible={this.state.conversionModalVisible}
            convertQuery={convert2Otql}
          />
        )}
      </div>
    );
  }
}

export default compose<Props, SegmentBuilderPreviewProps>(
  injectIntl,
  injectDrawer,
)(SegmentBuilderPreview);
