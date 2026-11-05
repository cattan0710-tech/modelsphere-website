import type { Root } from 'mdast';
import type {} from 'remark-directive';
import { toString } from 'mdast-util-to-string';
import { visit } from 'unist-util-visit';

// Authors supply Markdown content only; the element and its attributes are fixed.
export default function remarkFollowCard() {
  return (tree: Root) => {
    visit(tree, 'containerDirective', (node) => {
      if (node.name !== 'follow') return;
      if (Object.keys(node.attributes ?? {}).length)
        throw new Error('关注卡片不允许自定义属性');
      node.data = {
        hName: 'aside',
        hProperties: {
          className: ['blog-follow-card'],
          'aria-label': toString(node.children[0]),
        },
      };
    });
  };
}
