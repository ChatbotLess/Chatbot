import { createContext, useCallback, useContext, useRef, useState } from "react";

export const StreamContext = createContext(null);

const STREAM_FLUSH_INTERVAL_MS = 30;

export function StreamProvider({ children }) {
  // Mensagem do usuário que foi enviada (exibida imediatamente enquanto processa)
  const [pendingUserMessage, setPendingUserMessage] = useState(null);
  // Texto acumulado da resposta em streaming
  const [streamingText, setStreamingText] = useState("");
  // Se está streamando no momento
  const [isStreaming, setIsStreaming] = useState(false);

  const abortRef = useRef(null);
  const textBufferRef = useRef("");
  const flushTimeoutRef = useRef(null);

  const clearPendingFlush = useCallback(() => {
    if (flushTimeoutRef.current) {
      clearTimeout(flushTimeoutRef.current);
      flushTimeoutRef.current = null;
    }
  }, []);

  const flushStreamingText = useCallback(() => {
    clearPendingFlush();
    setStreamingText(textBufferRef.current);
  }, [clearPendingFlush]);

  const scheduleStreamingFlush = useCallback(() => {
    if (flushTimeoutRef.current) return;

    flushTimeoutRef.current = setTimeout(() => {
      flushTimeoutRef.current = null;
      setStreamingText(textBufferRef.current);
    }, STREAM_FLUSH_INTERVAL_MS);
  }, []);

  const startStream = useCallback(async (stream, userMessage) => {
    setPendingUserMessage(userMessage);
    textBufferRef.current = "";
    setStreamingText("");
    setIsStreaming(true);

    const reader = stream.getReader();
    const decoder = new TextDecoder();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        textBufferRef.current += chunk;
        scheduleStreamingFlush();
      }

      const remainingText = decoder.decode();
      if (remainingText) {
        textBufferRef.current += remainingText;
      }
    } catch {
      // stream cancelado ou erro
    } finally {
      flushStreamingText();
      setIsStreaming(false);
    }
  }, [flushStreamingText, scheduleStreamingFlush]);

  const clearStream = useCallback(() => {
    clearPendingFlush();
    textBufferRef.current = "";
    setPendingUserMessage(null);
    setStreamingText("");
    setIsStreaming(false);
  }, [clearPendingFlush]);

  return (
    <StreamContext.Provider
      value={{ pendingUserMessage, streamingText, isStreaming, startStream, clearStream }}
    >
      {children}
    </StreamContext.Provider>
  );
}

export function useStream() {
  return useContext(StreamContext);
}
