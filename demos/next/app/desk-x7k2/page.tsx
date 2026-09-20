'use client';

import { HiddenLoginPage } from '../../../shared/HiddenLogin';
import { Walkthrough } from '../../../shared/Walkthrough.tsx';

export default function Page() {
  return (
    <>
      <HiddenLoginPage />
      <Walkthrough />
    </>
  );
}
