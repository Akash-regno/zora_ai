"use client";

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownContentProps {
  content: string;
  className?: string;
}

export default function MarkdownContent({ content, className = '' }: MarkdownContentProps) {
  return (
    <div className={`markdown-content ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>,
          h1: ({ children }) => <h1 className="text-lg font-semibold mb-3 mt-2 text-[#ececec]">{children}</h1>,
          h2: ({ children }) => <h2 className="text-base font-semibold mb-2 mt-2 text-[#ececec]">{children}</h2>,
          h3: ({ children }) => <h3 className="text-sm font-semibold mb-2 mt-2 text-[#ececec]">{children}</h3>,
          ul: ({ children }) => <ul className="list-disc ml-5 mb-3 space-y-1">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal ml-5 mb-3 space-y-1">{children}</ol>,
          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
          code: ({ inline, children, ...props }: any) =>
            inline ? (
              <code className="bg-[#0d0d0d] px-1.5 py-0.5 rounded text-[13px] font-mono text-[#ececec]" {...props}>
                {children}
              </code>
            ) : (
              <code className="block bg-[#0d0d0d] text-[#ececec] p-3 rounded-lg text-[13px] font-mono overflow-x-auto mb-3 leading-relaxed border border-[#4d4d4d]" {...props}>
                {children}
              </code>
            ),
          pre: ({ children }) => <pre className="mb-3 overflow-hidden rounded-lg">{children}</pre>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-[#4d4d4d] pl-4 py-1 mb-3 text-[#b4b4b4] italic">
              {children}
            </blockquote>
          ),
          a: ({ children, href }) => (
            <a href={href} className="text-[#ececec] underline hover:text-[#b4b4b4]" target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          ),
          strong: ({ children }) => <strong className="font-semibold text-[#ececec]">{children}</strong>,
          em: ({ children }) => <em className="italic">{children}</em>,
          hr: () => <hr className="border-[#4d4d4d] my-3" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
