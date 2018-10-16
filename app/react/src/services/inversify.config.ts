import 'reflect-metadata';
import getDecorators from 'inversify-inject-decorators';
import { Container } from 'inversify';
import {
  IKeywordService,
  KeywordListService,
} from './Library/KeywordListsService';

const container = new Container();
container.bind<IKeywordService>('keywordListService').to(KeywordListService);
export const { lazyInject } = getDecorators(container);

export default container;
