import type { DetailedHTMLProps, HTMLAttributes } from 'react';

declare global {
  namespace React {
    namespace JSX {
      interface IntrinsicElements {
        'editable-chip': DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
      }
    }
  }
}

export {};
