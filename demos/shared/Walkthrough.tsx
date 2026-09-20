'use client';

import { useEffect } from 'react';
import { setEditing } from 'editable-website';
import { isDemoOwner } from './hidden-login';
import { bootWalkthrough } from './ew-walk.js';

export function Walkthrough() {
  useEffect(() => {
    bootWalkthrough({
      isAdmin: () => isDemoOwner(),
      setEditing,
    });
  }, []);
  return null;
}
