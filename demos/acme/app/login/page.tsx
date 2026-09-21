import { redirect } from 'next/navigation';
import { HIDDEN_LOGIN_PATH } from '@/lib/hidden-login-path';

export default function LoginRedirect() {
  redirect(HIDDEN_LOGIN_PATH);
}
