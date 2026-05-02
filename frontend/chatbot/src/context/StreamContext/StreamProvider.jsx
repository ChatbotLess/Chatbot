import { createContext, useCallback, useContext, useRef, useState } from "react";

export const StreamContext = createContext(null);

const STREAM_FLUSH_INTERVAL_MS = 30;

export function StreamProvider({ children }) {
  const [pendingUserMessage, setPendingUserMessage] = useState(null);
  const [streamingText, setStreamingText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);

  const textBufferRef = useRef("");
  const flushTimeoutRef = useRef(null);
  const streamIdRef = useRef(0);
  const readerRef = useRef(null);

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

  const startStream = useCallback(
    async (stream, userMessage) => {
      const streamId = ++streamIdRef.current;

      clearPendingFlush();
      readerRef.current?.cancel?.();
      readerRef.current = null;
      textBufferRef.current = "";
      setPendingUserMessage(userMessage);
      setStreamingText("");
      setIsStreaming(true);

      const reader = stream.getReader();
      readerRef.current = reader;

      const decoder = new TextDecoder();

      try {
        while (streamId === streamIdRef.current) {
          const { done, value } = await reader.read();

          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          textBufferRef.current += chunk;
          scheduleStreamingFlush();
        }

        const remainingText = decoder.decode();

        if (remainingText && streamId === streamIdRef.current) {
          textBufferRef.current += remainingText;
        }
      } catch (error) {
        if (error?.name !== "AbortError") {
          console.error("Erro durante streaming:", error);
        }
      } finally {
        if (streamId === streamIdRef.current) {
          flushStreamingText();
          setIsStreaming(false);
          readerRef.current = null;
        }
      }
    },
    [clearPendingFlush, flushStreamingText, scheduleStreamingFlush]
  );

  const clearStream = useCallback(() => {
    streamIdRef.current += 1;

    clearPendingFlush();

    readerRef.current?.cancel?.();
    readerRef.current = null;

    textBufferRef.current = "";
    setPendingUserMessage(null);
    setStreamingText("");
    setIsStreaming(false);
  }, [clearPendingFlush]);

  return (
    <StreamContext.Provider
      value={{
        pendingUserMessage,
        streamingText,
        isStreaming,
        startStream,
        clearStream,
      }}
    >
      {children}
    </StreamContext.Provider>
  );
}

export function useStream() {
  return useContext(StreamContext);
}
