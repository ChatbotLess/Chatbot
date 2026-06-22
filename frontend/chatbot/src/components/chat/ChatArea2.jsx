import { memo, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { TbThumbDown, TbThumbUp } from "react-icons/tb";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { FeedbackModal } from "../FeedbackModal";
import { Promptbar } from "../Promptbar";
import {
  chatQueryKeys,
  getChatQueryScope,
  useChatFeedbacks,
  useChatMessages,
} from "../../hooks/useChatData";
import { useFeedbackMutate } from "../../hooks/useFeedbackMutate";
import { useStream } from "../../context/StreamContext/StreamProvider";
import { AuthContext } from "../../context/AuthProvider/AuthProvider";

const markdownComponents = {
  a: ({ ...props }) => (
    <a
      {...props}
      target="_blank"
      rel="noreferrer"
          className="text-ifes-green-700 underline decoration-ifes-green-500/50 underline-offset-2 transition hover:text-ifes-green-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ifes-green-500/60"
    />
  ),

  code: ({ children, ...props }) => (
    <code
      {...props}
      className="rounded bg-gray-50 px-1.5 py-0.5 text-[0.9em] text-ifes-green-700"
    >
      {children}
    </code>
  ),

  h1: ({ children, ...props }) => (
    <h1 {...props} className="text-lg font-semibold text-gray-950">
      {children}
    </h1>
  ),

  h2: ({ children, ...props }) => (
    <h2 {...props} className="text-base font-semibold text-gray-950">
      {children}
    </h2>
  ),

  h3: ({ children, ...props }) => (
    <h3 {...props} className="text-base font-semibold text-gray-950">
      {children}
    </h3>
  ),

  ol: ({ ...props }) => (
    <ol {...props} className="list-decimal space-y-2 pl-5" />
  ),

  p: ({ ...props }) => <p {...props} />,

  pre: ({ ...props }) => (
    <pre
      {...props}
      className="overflow-x-auto rounded-md bg-gray-50 p-3 text-xs leading-5 text-gray-900"
    />
  ),

  strong: ({ ...props }) => (
    <strong {...props} className="font-semibold text-gray-950" />
  ),

  table: ({ ...props }) => (
    <div className="overflow-x-auto rounded-md border border-gray-300">
      <table {...props} className="w-full border-collapse text-left text-sm" />
    </div>
  ),

  tbody: ({ ...props }) => (
    <tbody {...props} className="divide-y divide-gray-200" />
  ),

  td: ({ ...props }) => (
    <td
      {...props}
      className="border-l border-gray-200 px-3 py-2 align-top first:border-l-0"
    />
  ),

  th: ({ ...props }) => (
    <th
      {...props}
      className="border-l border-gray-300 bg-gray-50 px-3 py-2 align-top font-semibold text-gray-950 first:border-l-0"
    />
  ),

  thead: ({ ...props }) => (
    <thead {...props} className="border-b border-gray-300" />
  ),

  ul: ({ ...props }) => (
    <ul {...props} className="list-disc space-y-2 pl-5" />
  ),
};

const MarkdownMessage = memo(function MarkdownMessage({ content }) {
  return (
    <div className="space-y-3">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
        {content}
      </ReactMarkdown>
    </div>
  );
});

function getFeedbackMessageId(feedback) {
  const message = feedback?.mensagem;

  if (message && typeof message === "object") {
    return message.id;
  }

  return message;
}

function getErrorMessage(error) {
  const detail = error?.response?.data?.detail;

  if (typeof detail === "string") return detail;

  if (Array.isArray(detail)) {
    const messages = detail
      .map((item) => item?.msg || item?.message)
      .filter(Boolean)
      .join(" ");

    return messages || "Dados do feedback invalidos.";
  }

  if (detail && typeof detail === "object") {
    return detail.msg || detail.message || "Nao foi possivel registrar o feedback.";
  }

  return "Nao foi possivel registrar o feedback.";
}

const FeedbackActions = memo(function FeedbackActions({
  chatId,
  initialFeedback,
  messageId,
}) {
  const { mutate, isPending } = useFeedbackMutate();
  const queryClient = useQueryClient();
  const { user } = useContext(AuthContext);
  const chatScope = getChatQueryScope(user);

  const [submittedFeedback, setSubmittedFeedback] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const selectedFeedback = submittedFeedback?.tipo ?? initialFeedback?.tipo ?? null;

  const savedFeedbackText =
    submittedFeedback?.mensagem_feedback ??
    initialFeedback?.mensagem_feedback ??
    "";

  const submitFeedback = ({ tipo, mensagem_feedback = "" }) => {
    if (!chatId || messageId === undefined || messageId === null || isPending) return;

    mutate(
      {
        chatId,
        messageId,
        tipo,
        mensagem_feedback,
      },
      {
        onSuccess: (feedback) => {
          setSubmittedFeedback(feedback ?? { tipo, mensagem_feedback });
          setIsModalOpen(false);
          setFeedbackText(feedback?.mensagem_feedback ?? mensagem_feedback);
          setErrorMessage("");

          if (chatId) {
            queryClient.invalidateQueries({
              queryKey: chatQueryKeys.feedbacks(chatScope, chatId),
            });
          }
        },

        onError: (error) => {
          setErrorMessage(getErrorMessage(error));
        },
      }
    );
  };

  const handleLike = () => {
    setErrorMessage("");
    submitFeedback({ tipo: "LIKE" });
  };

  const handleDislikeClick = () => {
    setErrorMessage("");
    setFeedbackText(savedFeedbackText);
    setIsModalOpen(true);
  };

  const handleDislikeSubmit = (event) => {
    event.preventDefault();

    const trimmedFeedback = feedbackText.trim();

    if (!trimmedFeedback) {
      setErrorMessage("Descreva rapidamente o motivo do dislike.");
      return;
    }

    submitFeedback({
      tipo: "DISLIKE",
      mensagem_feedback: trimmedFeedback,
    });
  };

  return (
    <>
      <div className="mt-2 flex items-center gap-1">
        <button
          type="button"
          onClick={handleLike}
          disabled={isPending}
          className={`rounded-md p-1.5 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ifes-green-500/60 disabled:cursor-not-allowed disabled:opacity-50 ${
            selectedFeedback === "LIKE"
              ? "bg-ifes-green-500/20 text-ifes-green-700"
              : "text-gray-500 hover:bg-gray-100 hover:text-gray-800"
          }`}
          aria-label="Curtir resposta"
          title="Curtir resposta"
        >
          <TbThumbUp size={18} />
        </button>

        <button
          type="button"
          onClick={handleDislikeClick}
          disabled={isPending}
          className={`rounded-md p-1.5 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ifes-green-500/60 disabled:cursor-not-allowed disabled:opacity-50 ${
            selectedFeedback === "DISLIKE"
              ? "bg-ifes-red-500/20 text-ifes-red-700"
              : "text-gray-500 hover:bg-gray-100 hover:text-gray-800"
          }`}
          aria-label="Nao curtir resposta"
          title="Nao curtir resposta"
        >
          <TbThumbDown size={18} />
        </button>
      </div>

      {errorMessage && !isModalOpen && (
        <p className="mt-1 text-xs text-ifes-red-700">{errorMessage}</p>
      )}

      {isModalOpen && (
        <FeedbackModal
          errorMessage={errorMessage}
          feedbackText={feedbackText}
          isPending={isPending}
          onChange={setFeedbackText}
          onClose={() => {
            setIsModalOpen(false);
            setErrorMessage("");
          }}
          onSubmit={handleDislikeSubmit}
        />
      )}
    </>
  );
});

const MessageBubble = memo(function MessageBubble({
  chatId,
  feedback,
  message,
}) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[92%] sm:max-w-[85%] ${isUser ? "flex justify-end" : ""}`}>
        <div
          className={
            isUser ? "flex flex-col items-end" : "flex flex-col items-start"
          }
        >
          <article
            className={`break-words rounded-lg px-3 py-2.5 text-sm leading-6 shadow-sm xs:px-4 xs:py-3 ${
              isUser
                ? "whitespace-pre-wrap bg-ifes-green-600 text-white"
                : "border border-gray-200 bg-white text-gray-900"
            }`}
          >
            {isUser ? (
              message.conteudo
            ) : (
              <MarkdownMessage content={message.conteudo} />
            )}
          </article>

          {!isUser && message.id !== undefined && message.id !== null && (
            <FeedbackActions
              chatId={chatId}
              initialFeedback={feedback}
              messageId={message.id}
            />
          )}
        </div>
      </div>
    </div>
  );
});

function findLastMessageIndex(messages, predicate) {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    if (predicate(messages[index])) {
      return index;
    }
  }

  return -1;
}

export function ChatArea2({ conversationId }) {
  const messagesEndRef = useRef(null);

  const { pendingUserMessage, streamingText, isStreaming } = useStream();

  const {
    data: messages = [],
    isError,
    isLoading,
  } = useChatMessages(conversationId, Boolean(conversationId));

  const { data: feedbacks = [] } = useChatFeedbacks(
    conversationId,
    Boolean(conversationId)
  );

  const lastMessageId = messages.at(-1)?.id;

  const feedbackByMessageId = useMemo(() => {
    return new Map(
      feedbacks.map((feedback) => [
        String(getFeedbackMessageId(feedback)),
        feedback,
      ])
    );
  }, [feedbacks]);

  const showStreaming = (isStreaming || streamingText) && !isLoading;

  const displayedMessages = useMemo(() => {
    if (!showStreaming) {
      return messages;
    }

    const hiddenMessageIndexes = new Set();

    if (pendingUserMessage) {
      const pendingUserIndex = findLastMessageIndex(
        messages,
        (message) =>
          message.role === "user" && message.conteudo === pendingUserMessage
      );

      if (pendingUserIndex >= 0) {
        hiddenMessageIndexes.add(pendingUserIndex);
      }
    }

    if (streamingText) {
      const streamedAssistantIndex = findLastMessageIndex(
        messages,
        (message) =>
          message.role === "assistant" &&
          message.conteudo?.trim() === streamingText.trim()
      );

      if (streamedAssistantIndex >= 0) {
        hiddenMessageIndexes.add(streamedAssistantIndex);
      }
    }

    if (!hiddenMessageIndexes.size) {
      return messages;
    }

    return messages.filter((_, index) => !hiddenMessageIndexes.has(index));
  }, [messages, showStreaming, pendingUserMessage, streamingText]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      block: "end",
      behavior: isStreaming ? "auto" : "smooth",
    });
  }, [
    conversationId,
    isLoading,
    messages.length,
    lastMessageId,
    pendingUserMessage,
    streamingText,
    isStreaming,
  ]);

  return (
    <div className="flex h-full min-h-0 w-full max-w-[760px] flex-col px-3 py-4 sm:px-4 sm:py-6">
      <div className="min-h-0 flex-1 overflow-y-auto pb-4 pr-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {isLoading && (
          <div className="rounded-md border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600">
            Carregando mensagens...
          </div>
        )}

        {isError && (
          <div className="rounded-md border border-ifes-red-200 bg-ifes-red-50 px-4 py-3 text-sm text-ifes-red-700">
            Nao foi possivel carregar as mensagens deste chat.
          </div>
        )}

        {!isLoading && !isError && messages.length === 0 && !showStreaming && (
          <div className="flex h-full items-center justify-center px-4 text-center">
            <div className="rounded-lg border border-dashed border-gray-200 px-5 py-6 text-sm text-gray-500">
              Nenhuma mensagem encontrada neste chat.
            </div>
          </div>
        )}

        {!isLoading && !isError && displayedMessages.length > 0 && (
          <div className="flex flex-col gap-4">
            {displayedMessages.map((message) => (
              <MessageBubble
                key={message.id}
                chatId={conversationId}
                feedback={feedbackByMessageId.get(String(message.id))}
                message={message}
              />
            ))}
          </div>
        )}

        {showStreaming && (
          <div
            className={`flex flex-col gap-4 ${
              messages.length > 0 ? "mt-4" : ""
            }`}
          >
            {pendingUserMessage && (
              <div className="flex justify-end">
                <article className="max-w-[92%] break-words rounded-lg bg-ifes-green-600 px-3 py-2.5 text-sm leading-6 text-white shadow-sm whitespace-pre-wrap xs:px-4 xs:py-3 sm:max-w-[85%]">
                  {pendingUserMessage}
                </article>
              </div>
            )}

            <div className="flex justify-start">
              <article className="max-w-[92%] break-words rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm leading-6 text-gray-900 shadow-sm xs:px-4 xs:py-3 sm:max-w-[85%]">
                {streamingText ? (
                  <MarkdownMessage content={streamingText} />
                ) : (
                  <div className="flex items-center gap-1 py-1">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.3s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.15s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400" />
                  </div>
                )}
              </article>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <Promptbar />
    </div>
  );
}
