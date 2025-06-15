import ReactMarkdown from "react-markdown";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";

interface MarkdownExampleProps {
  title: string;
  content: string;
}

export function MarkdownExample({ title, content }: MarkdownExampleProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw, rehypeSanitize]}
      components={{
        h1({ children }) {
          return (
            <h1 className="scroll-m-20 text-4xl font-bold tracking-tight mb-4">
              {children}
            </h1>
          );
        },
        h2({ children }) {
          return (
            <h2 className="scroll-m-20 text-3xl font-semibold tracking-tight mb-3 mt-6">
              {children}
            </h2>
          );
        },
        h3({ children }) {
          return (
            <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight mb-2 mt-5">
              {children}
            </h3>
          );
        },
        h4({ children }) {
          return (
            <h4 className="scroll-m-20 text-xl font-semibold tracking-tight mb-2 mt-4">
              {children}
            </h4>
          );
        },
        h5({ children }) {
          return (
            <h5 className="scroll-m-20 text-lg font-semibold tracking-tight mb-2 mt-3">
              {children}
            </h5>
          );
        },
        h6({ children }) {
          return (
            <h6 className="scroll-m-20 text-base font-semibold tracking-tight mb-2 mt-3">
              {children}
            </h6>
          );
        },
        a({ href, children }) {
          return (
            <a
              href={href}
              className="text-primary hover:underline transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          );
        },
        code({ className, children, ...props }) {
          return (
            <code
              className={`${className} bg-muted px-1.5 py-0.5 rounded text-xs font-mono`}
              {...props}
            >
              {children}
            </code>
          );
        },
        pre({ children, ...props }) {
          return (
            <pre
              className="bg-muted p-3 rounded text-xs font-mono whitespace-pre-wrap overflow-x-auto"
              {...props}
            >
              {children}
            </pre>
          );
        },
        p({ children }) {
          const content = children?.toString() || "";
          if (content.startsWith("<") && content.endsWith(">")) {
            const componentName = content.match(/<(\w+)/)?.[1];
            const props = content
              .match(/(\w+)="([^"]+)"/g)
              ?.reduce((acc, prop) => {
                const [key, value] = prop.split("=");
                acc[key] = value.replace(/"/g, "");
                return acc;
              }, {} as Record<string, string>);

            switch (componentName) {
              case "Button":
                return (
                  <Button {...props}>{content.match(/>([^<]+)</)?.[1]}</Button>
                );
              default:
                return <p>{children}</p>;
            }
          }
          return <p>{children}</p>;
        },
        table({ children }) {
          return (
            <div className="overflow-x-auto">
              <table className="border-collapse border border-border">
                {children}
              </table>
            </div>
          );
        },
        th({ children }) {
          return (
            <th className="border border-border px-4 py-2 bg-muted">
              {children}
            </th>
          );
        },
        td({ children }) {
          return <td className="border border-border px-4 py-2">{children}</td>;
        },
        blockquote({ children }) {
          return (
            <blockquote className="border-l-4 border-border pl-4 italic">
              {children}
            </blockquote>
          );
        },
        hr() {
          return <hr className="border-border my-4" />;
        },
        img({ src, alt }) {
          return (
            <img src={src} alt={alt} className="rounded-lg max-w-full h-auto" />
          );
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
