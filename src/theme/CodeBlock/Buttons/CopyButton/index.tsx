import { translate } from '@docusaurus/Translate';
import React, { useEffect, useRef, useState } from 'react';
import { useCodeBlockContext } from '@docusaurus/theme-common/internal';
import type { Props } from '@theme/CodeBlock/Buttons/CopyButton';
export default function CopyButton({ className }: Props) {
  const {
    metadata: { code },
  } = useCodeBlockContext();
  const [status, setStatus] = useState<'idle' | 'copying' | 'done' | 'failed'>(
    'idle',
  );
  const generation = useRef(0);
  const timeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => {
    generation.current++;
    setStatus('idle');
    return () => {
      generation.current++;
      clearTimeout(timeout.current);
    };
  }, [code]);
  async function copy() {
    const current = generation.current;
    setStatus('copying');
    try {
      if (!navigator.clipboard) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(code);
      if (current !== generation.current) return;
      setStatus('done');
      timeout.current = setTimeout(() => setStatus('idle'), 2000);
    } catch {
      if (current === generation.current) setStatus('failed');
    }
  }
  const label =
    status === 'done'
      ? translate({ id: 'site.8f6f8d979c98', message: '已复制' })
      : status === 'copying'
        ? translate({ id: 'site.35b9d1632e80', message: '复制中' })
        : status === 'failed'
          ? translate({
              id: 'site.bc31718db91d',
              message: '复制失败，请手动选择代码',
            })
          : translate({ id: 'site.420c20dd9fcc', message: '复制代码' });
  return (
    <span className="copy-control js-control">
      <button
        type="button"
        className={`${className ?? ''} copy-button`}
        disabled={status === 'copying'}
        onClick={copy}
        aria-label={translate({ id: 'site.420c20dd9fcc', message: '复制代码' })}
        title={label}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          {status === 'done' ? (
            <path d="m5 12 4 4L19 6" />
          ) : status === 'failed' ? (
            <>
              <circle cx="12" cy="12" r="9" />
              <path d="M12 8v4m0 4h.01" />
            </>
          ) : (
            <>
              <rect x="8" y="8" width="12" height="12" rx="2" />
              <path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3" />
            </>
          )}
        </svg>
      </button>
      <span
        role="status"
        className={status === 'failed' ? 'copy-error' : 'sr-only'}
      >
        {status === 'failed'
          ? translate({
              id: 'site.bc31718db91d',
              message: '复制失败，请手动选择代码',
            })
          : status === 'done'
            ? translate({ id: 'site.ea538e2ae64c', message: '代码已复制' })
            : ''}
      </span>
    </span>
  );
}
