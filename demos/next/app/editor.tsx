'use client';

import { useEffect } from 'react';
import { mount, unmount } from 'editable-website';
import { mountOptions } from '../../shared/browser-host';

export function Editor({ isAdmin }: { isAdmin: boolean }) {
  useEffect(() => {
    void mount(mountOptions({ isAdmin }));
    return () => unmount();
  }, [isAdmin]);

  return isAdmin ? <editable-chip data-demo="edit-chip" /> : null;
}
