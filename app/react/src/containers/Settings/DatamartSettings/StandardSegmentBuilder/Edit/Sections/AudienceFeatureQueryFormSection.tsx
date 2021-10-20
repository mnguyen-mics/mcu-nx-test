import * as React from 'react';
import { Button } from 'antd';
import { InjectedIntlProps, injectIntl, FormattedMessage } from 'react-intl';
import { compose } from 'recompose';
import { Actionbar, McsIcon } from '@mediarithmics-private/mcs-components-library';
import { injectDrawer } from '../../../../../../components/Drawer';
import { InjectedDrawerProps } from '../../../../../../components/Drawer/injectDrawer';
import OTQLConsoleContainer, {
  OTQLConsoleContainerProps,
} from '../../../../../QueryTool/OTQL/OTQLConsoleContainer';
import { withRouter, RouteComponentProps } from 'react-router';
import { FormSection } from '../../../../../../components/Form';
import { messages } from '../../messages';
import AceEditor from 'react-ace';
import CustomOtqlMode from '../../../../../../components/OtqlConsole/theme/CustomOtqlMode';
import { lazyInject } from '../../../../../../config/inversify.config';
import { TYPES } from '../../../../../../constants/types';
import { IAudienceFeatureService } from '../../../../../../services/AudienceFeatureService';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../../../Notifications/injectNotifications';

interface AudienceFeatureQueryFormSectionProps {
  associatedQuery?: string;
  formChange: (field: string, value: any) => void;
}

type Props = AudienceFeatureQueryFormSectionProps &
  InjectedDrawerProps &
  InjectedIntlProps &
  InjectedNotificationProps &
  RouteComponentProps<{ datamartId: string }>;

class AudienceFeatureQueryFormSection extends React.Component<Props> {
  @lazyInject(TYPES.IAudienceFeatureService)
  private _audienceFeatureService: IAudienceFeatureService;

  aceEditor: any = null;
  componentDidMount() {
    if (this.aceEditor && this.aceEditor.editor) {
      const customMode = new CustomOtqlMode();
      this.aceEditor.editor.getSession().setMode(customMode);
    }
  }
  openEditor = () => {
    const { intl, associatedQuery } = this.props;
    const createActionBar = (onSave: () => void, onClose: () => void, query: string) => {
      return (
        <Actionbar
          edition={true}
          pathItems={[
            intl.formatMessage({
              id: 'settings.datamart.audienceFeature.edit.query',
              defaultMessage: 'Edit with OTQL',
            }),
          ]}
        >
          <Button
            disabled={!query}
            className='mcs-primary mcs-audienceFeature_update_query'
            type='primary'
            onClick={onSave}
          >
            <FormattedMessage
              id='settings.datamart.audienceFeature.edit.update'
              defaultMessage='Update'
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
    const actionbar = (query: string) => {
      const onSave = () => {
        let objectTreeExpression = query;
        if (query.includes('where')) {
          objectTreeExpression = query.split('where')[1];
        } else if (query.includes('WHERE')) {
          objectTreeExpression = query.split('WHERE')[1];
        }

        this._audienceFeatureService
          .extractAudienceFeatureVariables(
            this.props.match.params.datamartId,
            objectTreeExpression!,
          )
          .then(response => {
            this.props.formChange('variables', response.data);
            this.props.formChange('object_tree_expression', objectTreeExpression);
            this.props.closeNextDrawer();
          })
          .catch(err => {
            this.props.notifyError(err);
          });
      };
      const onClose = () => this.props.closeNextDrawer();
      return createActionBar(onSave, onClose, query);
    };
    this.props.openNextDrawer<OTQLConsoleContainerProps>(OTQLConsoleContainer, {
      additionalProps: {
        datamartId: this.props.match.params.datamartId,
        renderActionBar: actionbar,
        query: 'SELECT @count{} FROM UserPoint where ' + associatedQuery,
        queryEditorClassName: 'mcs-audienceFeature_edit_form_query_builder',
      },
    });
  };
  render() {
    const { associatedQuery } = this.props;
    const setAceEditorRef = (aceEditorRef: any) => (this.aceEditor = aceEditorRef);
    return (
      <React.Fragment>
        <FormSection
          subtitle={messages.audienceFeatureSectionGeneralSubTitle}
          title={messages.audienceFeatureAssociatedQuery}
        />
        <Button
          onClick={this.openEditor}
          className='m-b-20 float-right mcs-audienceFeature_edit_query_button'
        >
          {this.props.intl.formatMessage({
            id: 'jsonql.button.query.edit',
            defaultMessage: 'Edit Query',
          })}
        </Button>

        <AceEditor
          mode='otql'
          theme='otql'
          width='100%'
          height='100px'
          readOnly={true}
          ref={setAceEditorRef}
          value={'SELECT @count{} FROM UserPoint where ' + associatedQuery}
          setOptions={{
            showGutter: true,
          }}
        />
      </React.Fragment>
    );
  }
}

export default compose<Props, AudienceFeatureQueryFormSectionProps>(
  injectIntl,
  injectDrawer,
  injectNotifications,
  withRouter,
)(AudienceFeatureQueryFormSection);
