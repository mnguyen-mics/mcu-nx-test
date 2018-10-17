import getDecorators from 'inversify-inject-decorators';
import { Container } from 'inversify';
import 'reflect-metadata';
import {
  IKeywordService,
  KeywordListService,
} from './Library/KeywordListsService';

export const SERVICE_IDENTIFIER = {
  IKeywordListService: Symbol('KeywordListService'),
};

const container = new Container();
container
  .bind<IKeywordService>(SERVICE_IDENTIFIER.IKeywordListService)
  .to(KeywordListService);
export const { lazyInject } = getDecorators(container);

export default container;
