import getDecorators from 'inversify-inject-decorators';
import { Container } from 'inversify';
import {
  IKeywordListService,
  KeywordListService,
} from '../services/Library/KeywordListsService';
import {
 IKeywordListFormService,
 KeywordListFormService,
} from '../containers/Library/Keyword/Edit/KeywordListFormService';
import { TYPES } from '../constants/types';

const container = new Container();

container
  .bind<IKeywordListService>(TYPES.IKeywordListService)
  .to(KeywordListService);
container
  .bind<IKeywordListFormService>(TYPES.IKeywordListFormService)
  .to(KeywordListFormService);

export const { lazyInject } = getDecorators(container, false);

export default { container };
