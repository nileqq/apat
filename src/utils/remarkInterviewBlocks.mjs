function remarkInterviewBlocks() {
  return (tree) => {
    visit(tree, transformInterviewLine);
    groupDialogueLines(tree);
  };
}

function visit(node, visitor) {
  if (!node) return;
  visitor(node);
  if (Array.isArray(node.children)) {
    node.children.forEach((child) => visit(child, visitor));
  }
}

// Handles paragraphs whose body contains inline markup (e.g. a term-tooltip
// <span>), which splits the paragraph into several child nodes instead of a
// single text node.
function transformInterviewLine(node) {
  if (node.type !== 'paragraph') return;

  const children = node.children ?? [];
  if (children.length === 0) return;

  const first = children[0];
  if (first.type !== 'text') return;

  const openMatch = first.value.match(/^@([^\s{]+)\s*\{([\s\S]*)$/);

  if (!openMatch) {
    if (children.length !== 1) return;
    const parsed = parseInterviewText(first.value);
    if (!parsed) return;
    applyInterviewLine(node, parsed.speaker, [{ type: 'text', value: parsed.text }]);
    return;
  }

  const speaker = openMatch[1].trim();
  if (!speaker) return;

  const bodyChildren = [...children];
  bodyChildren[0] = { type: 'text', value: openMatch[2].replace(/^\s+/, '') };

  const last = bodyChildren[bodyChildren.length - 1];
  if (last.type !== 'text') return;
  const closeMatch = last.value.match(/^([\s\S]*?)\}\s*$/);
  if (!closeMatch) return;
  bodyChildren[bodyChildren.length - 1] = { type: 'text', value: closeMatch[1].replace(/\s+$/, '') };

  const trimmedChildren = bodyChildren.filter(
    (child, i) => child.type !== 'text' || child.value.length > 0 || (i !== 0 && i !== bodyChildren.length - 1)
  );

  applyInterviewLine(node, speaker, trimmedChildren);
}

function applyInterviewLine(node, speaker, bodyChildren) {
  node.data ||= {};
  node.data.hName = 'div';
  node.data.hProperties = { className: ['interview-line'] };
  node.children = [
    {
      type: 'strong',
      data: {
        hName: 'span',
        hProperties: { className: ['interview-speaker'] },
      },
      children: [{ type: 'text', value: speaker }],
    },
    ...bodyChildren,
  ];
}

function parseInterviewText(value) {
  const match = value.match(/^@([^\s{]+)\s*(?:\{([\s\S]*)\}|([\s\S]*))$/);
  if (!match) return null;

  const speaker = match[1].trim();
  const rawText = match[2] ?? match[3] ?? '';
  const text = rawText.trim();

  if (!speaker || !text) return null;

  return { speaker, text };
}

function isInterviewLine(node) {
  return Boolean(node?.data?.hProperties?.className?.includes('interview-line'));
}

// Wraps consecutive @speaker { ... } lines in a shared container so a whole
// back-and-forth exchange renders as one nested dialogue block.
function groupDialogueLines(node) {
  if (!node || !Array.isArray(node.children)) return;

  node.children.forEach(groupDialogueLines);

  const grouped = [];
  let buffer = [];

  const flushBuffer = () => {
    if (buffer.length === 0) return;
    if (buffer.length === 1) {
      grouped.push(buffer[0]);
    } else {
      grouped.push({
        type: 'paragraph',
        data: {
          hName: 'div',
          hProperties: { className: ['interview-dialogue'] },
        },
        children: buffer,
      });
    }
    buffer = [];
  };

  node.children.forEach((child) => {
    if (isInterviewLine(child)) {
      buffer.push(child);
    } else {
      flushBuffer();
      grouped.push(child);
    }
  });
  flushBuffer();

  node.children = grouped;
}

export { remarkInterviewBlocks };
export default remarkInterviewBlocks;
