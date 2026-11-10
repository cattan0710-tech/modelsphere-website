import React from 'react';
import Link from '@docusaurus/Link';
import { useHistory } from '@docusaurus/router';
import { useSitePath } from '@site/src/lib/use-site-path';
import { modelNavigationState } from './routes';

type Props = Omit<React.ComponentProps<typeof Link>, 'to' | 'href'> & {
  to: string;
  version: string;
  returnTo?: string;
};

// Keep the public href shareable while retaining the current list and snapshot
// on ordinary in-tab navigation. Native new-tab/copy-link behavior stays intact.
export default function CatalogLink({
  to,
  version,
  returnTo,
  onClick,
  ...props
}: Props) {
  const history = useHistory();
  const { siteHref } = useSitePath();
  return (
    <Link
      {...props}
      to={to}
      onClick={(event) => {
        onClick?.(event);
        if (
          (!to.startsWith('/model?') && !to.startsWith('/recipe?')) ||
          event.defaultPrevented ||
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey ||
          props.download ||
          (props.target && props.target !== '_self')
        )
          return;
        event.preventDefault();
        history.push(siteHref(to), modelNavigationState(version, returnTo));
      }}
    />
  );
}
