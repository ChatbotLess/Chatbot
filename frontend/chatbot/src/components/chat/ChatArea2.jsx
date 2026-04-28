import { useEffect, useRef } from "react";
import rehypeRaw from "rehype-raw";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Promptbar } from "../Promptbar"
import { useChatMessages } from "../../hooks/useChatData";

function MarkdownMessage({ content }) {
  return (
    <div className="space-y-3">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          a: ({ ...props }) => (
            <a
              {...props}
              target="_blank"
              rel="noreferrer"
              className="text-blue-300 underline decoration-blue-300/50 underline-offset-2 hover:text-blue-200"
            />
          ),
          code: ({ children, ...props }) => (
            <code
              {...props}
              className="rounded bg-gray-950 px-1.5 py-0.5 text-[0.9em] text-blue-100"
            >
              {children}
            </code>
          ),
          h1: ({ ...props }) => <h1 {...props} className="text-lg font-semibold text-white" />,
          h2: ({ ...props }) => <h2 {...props} className="text-base font-semibold text-white" />,
          h3: ({ ...props }) => <h3 {...props} className="text-base font-semibold text-white" />,
          ol: ({ ...props }) => <ol {...props} className="list-decimal space-y-2 pl-5" />,
          p: ({ ...props }) => <p {...props} />,
          pre: ({ ...props }) => (
            <pre
              {...props}
              className="overflow-x-auto rounded-md bg-gray-950 p-3 text-xs leading-5 text-gray-100"
            />
          ),
          strong: ({ ...props }) => <strong {...props} className="font-semibold text-white" />,
          table: ({ ...props }) => (
            <div className="overflow-x-auto rounded-md border border-gray-700">
              <table {...props} className="w-full border-collapse text-left text-sm" />
            </div>
          ),
          tbody: ({ ...props }) => <tbody {...props} className="divide-y divide-gray-800" />,
          td: ({ ...props }) => (
            <td {...props} className="border-l border-gray-800 px-3 py-2 align-top first:border-l-0" />
          ),
          th: ({ ...props }) => (
            <th {...props} className="border-l border-gray-700 bg-gray-950 px-3 py-2 align-top font-semibold text-white first:border-l-0" />
          ),
          thead: ({ ...props }) => <thead {...props} className="border-b border-gray-700" />,
          ul: ({ ...props }) => <ul {...props} className="list-disc space-y-2 pl-5" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}


export function ChatArea2({ conversationId }) {
  const messagesEndRef = useRef(null);
  const {
    data: messages = [],
    isError,
    isLoading,
  } = useChatMessages(conversationId, Boolean(conversationId));
  const lastMessageId = messages.at(-1)?.id;

  useEffect(() => {
    if (!isLoading && messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ block: "end" });
    }
  }, [conversationId, isLoading, messages.length, lastMessageId]);

  return (
      <div className="flex h-full w-full max-w-[760px] flex-col px-4 py-6">
        <div className="min-h-0 flex-1 overflow-y-auto pb-5 pr-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {isLoading && (
            <div className="rounded-md border border-gray-800 bg-gray-900/70 px-4 py-3 text-sm text-gray-400">
              Carregando mensagens...
            </div>
          )}

          {isError && (
            <div className="rounded-md border border-red-900/60 bg-red-950/30 px-4 py-3 text-sm text-red-200">
              Nao foi possivel carregar as mensagens deste chat.
            </div>
          )}

          {!isLoading && !isError && messages.length === 0 && (
            <div className="flex h-full items-center justify-center text-center text-sm text-gray-500">
              Nenhuma mensagem encontrada neste chat.
            </div>
          )}

          {!isLoading && !isError && messages.length > 0 && (
            <div className="flex flex-col gap-4">
              {messages.map((message) => {
                const isUser = message.role === "user";

                return (
                  <div
                    key={message.id}
                    className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                  >
                    <article
                      className={`max-w-[85%] break-words rounded-lg px-4 py-3 text-sm leading-6 shadow-sm ${
                        isUser
                          ? "whitespace-pre-wrap bg-blue-600 text-white"
                          : "border border-gray-800 bg-gray-900 text-gray-100"
                      }`}
                    >
                      {isUser ? message.conteudo : <MarkdownMessage content={message.conteudo} />}
                    </article>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <Promptbar/>
      </div>
  )
}
