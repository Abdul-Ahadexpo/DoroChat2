import React from 'react';
import { parseMarkdown } from '../utils/markdownParser';

interface MarkdownRendererProps {
  text: string;
  className?: string;
}

export function MarkdownRenderer({ text, className = '' }: MarkdownRendererProps) {
  const elements = parseMarkdown(text);
  
  return (
    <div className={className}>
      {elements.map((element, index) => {
        switch (element.type) {
          case 'h1':
            return (
              <h1 key={index} className="text-xl sm:text-2xl font-bold mb-2 text-white">
                {element.content}
              </h1>
            );
          case 'h2':
            return (
              <h2 key={index} className="text-lg sm:text-xl font-bold mb-2 text-white">
                {element.content}
              </h2>
            );
          case 'h3':
            return (
              <h3 key={index} className="text-base sm:text-lg font-bold mb-1 text-white">
                {element.content}
              </h3>
            );
          case 'h4':
            return (
              <h4 key={index} className="text-sm sm:text-base font-bold mb-1 text-white">
                {element.content}
              </h4>
            );
          case 'h5':
            return (
              <h5 key={index} className="text-xs sm:text-sm font-bold mb-1 text-white">
                {element.content}
              </h5>
            );
          case 'h6':
            return (
              <h6 key={index} className="text-xs font-bold mb-1 text-white">
                {element.content}
              </h6>
            );
          case 'bold':
            return (
              <strong key={index} className="font-bold text-white">
                {element.content}
              </strong>
            );
          case 'italic':
            return (
              <em key={index} className="italic text-white">
                {element.content}
              </em>
            );
          case 'strikethrough':
            return (
              <del key={index} className="line-through text-gray-300">
                {element.content}
              </del>
            );
          case 'code':
            return (
              <code key={index} className="bg-gray-700 text-green-400 px-1 py-0.5 rounded text-xs font-mono">
                {element.content}
              </code>
            );
          case 'link':
            return (
              <a
                key={index}
                href={element.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-300 hover:text-blue-200 underline break-all"
              >
                {element.content}
              </a>
            );
          case 'linebreak':
            return <br key={index} />;
          case 'text':
          default:
            return <span key={index}>{element.content}</span>;
        }
      })}
    </div>
  );
}