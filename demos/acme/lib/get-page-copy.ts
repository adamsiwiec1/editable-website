import { cache } from 'react';
import { copyStore } from './copy-store';

export const getPageCopy = cache(async () => copyStore.get());
