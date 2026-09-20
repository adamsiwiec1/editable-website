'use client';

import { useRouter } from 'next/navigation';
import { HiddenLoginForm } from '@/components/demo/hidden-login';

export function LoginForm() {
  const router = useRouter();

  return (
    <HiddenLoginForm
      onSuccess={() => {
        router.push('/');
      }}
    />
  );
}
