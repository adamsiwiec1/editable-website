import { resolveCopyKey, type CopyKey } from '@/lib/copy';
import { getPageCopy } from '@/lib/get-page-copy';

type CopyTag = 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'li';

export async function CopyText({
  k,
  as: Tag = 'span',
  className,
  multiline = false,
}: {
  k: CopyKey;
  as?: CopyTag;
  className?: string;
  multiline?: boolean;
}) {
  const content = await getPageCopy();
  const value = resolveCopyKey(content.copy, k);

  return (
    <Tag data-copy={k} {...(multiline ? { 'data-copy-multiline': '' } : {})} className={className}>
      {value}
    </Tag>
  );
}
