import getDecorators from 'inversify-inject-decorators';
import { Container } from 'inversify';
import {
  IKeywordListService,
  KeywordListService,
} from './Library/KeywordListsService';

const SERVICE_IDENTIFIER = {
  IKeywordListService: Symbol.for('KeywordListService'),
  IKeywordListFormService: Symbol.for('KeywordListFormService'),
};

export { SERVICE_IDENTIFIER };

const container = new Container();

container
  .bind<IKeywordListService>(SERVICE_IDENTIFIER.IKeywordListService)
  .to(KeywordListService);

export const { lazyInject } = getDecorators(container);

export default { container };
