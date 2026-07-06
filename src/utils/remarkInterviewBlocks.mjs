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

function transformInterviewLine(node) {
  if (node.type !== 'paragraph') return;

  const textNodes = node.children?.filter((child) => child.type === 'text') ?? [];
  if (textNodes.length !== 1) return;

  const parsed = parseInterviewText(textNodes[0].value);
  if (!parsed) return;

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
      children: [{ type: 'text', value: parsed.speaker }],
    },
    {
      type: 'text',
      value: parsed.text,
    },
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
