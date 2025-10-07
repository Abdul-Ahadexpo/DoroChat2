interface MarkdownElement {
  type: 'text' | 'bold' | 'italic' | 'strikethrough' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'code' | 'link' | 'linebreak';
  content: string;
  href?: string;
}

export function parseMarkdown(text: string): MarkdownElement[] {
  const elements: MarkdownElement[] = [];
  const lines = text.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check for headers first (must be at start of line)
    if (line.match(/^#{1,6}\s/)) {
      const headerMatch = line.match(/^(#{1,6})\s(.+)$/);
      if (headerMatch) {
        const level = headerMatch[1].length;
        const content = headerMatch[2];
        elements.push({
          type: `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6',
          content: content
        });
        if (i < lines.length - 1) {
          elements.push({ type: 'linebreak', content: '' });
        }
        continue;
      }
    }
    
    // Parse inline formatting
    const inlineElements = parseInlineFormatting(line);
    elements.push(...inlineElements);
    
    // Add line break if not the last line
    if (i < lines.length - 1) {
      elements.push({ type: 'linebreak', content: '' });
    }
  }
  
  return elements;
}

function parseInlineFormatting(text: string): MarkdownElement[] {
  const elements: MarkdownElement[] = [];
  let currentIndex = 0;
  
  // Regex patterns for different markdown elements
  const patterns = [
    { regex: /\*\*(.+?)\*\*/g, type: 'bold' as const },
    { regex: /\*(.+?)\*/g, type: 'italic' as const },
    { regex: /~~(.+?)~~/g, type: 'strikethrough' as const },
    { regex: /`(.+?)`/g, type: 'code' as const },
    { regex: /\[(.+?)\]\((.+?)\)/g, type: 'link' as const }
  ];
  
  // Find all matches with their positions
  const matches: Array<{
    index: number;
    length: number;
    type: 'bold' | 'italic' | 'strikethrough' | 'code' | 'link';
    content: string;
    href?: string;
  }> = [];
  
  patterns.forEach(pattern => {
    let match;
    const regex = new RegExp(pattern.regex.source, 'g');
    
    while ((match = regex.exec(text)) !== null) {
      matches.push({
        index: match.index,
        length: match[0].length,
        type: pattern.type,
        content: match[1],
        href: pattern.type === 'link' ? match[2] : undefined
      });
    }
  });
  
  // Sort matches by position
  matches.sort((a, b) => a.index - b.index);
  
  // Process matches and add text elements
  matches.forEach(match => {
    // Add text before this match
    if (match.index > currentIndex) {
      const textContent = text.slice(currentIndex, match.index);
      if (textContent) {
        elements.push({ type: 'text', content: textContent });
      }
    }
    
    // Add the formatted element
    elements.push({
      type: match.type,
      content: match.content,
      href: match.href
    });
    
    currentIndex = match.index + match.length;
  });
  
  // Add remaining text
  if (currentIndex < text.length) {
    const remainingText = text.slice(currentIndex);
    if (remainingText) {
      elements.push({ type: 'text', content: remainingText });
    }
  }
  
  // If no matches found, return the whole text as a single element
  if (elements.length === 0 && text) {
    elements.push({ type: 'text', content: text });
  }
  
  return elements;
}