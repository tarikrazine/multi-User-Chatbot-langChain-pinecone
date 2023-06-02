"use client"

import { useRef, useState, useEffect } from "react";

import Image from "next/image";

import ReactMarkdown from "react-markdown";
import { Document } from "langchain/document";
import { fetchEventSource } from "@microsoft/fetch-event-source";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/Accordion";
import LoadingDots from "@/components/ui/LoadingDots";

import { Message } from "@/types/chat";

import styles from "@/styles/Home.module.css";

export default function Home() {
  const [query, setQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [messageState, setMessageState] = useState<{
    messages: Message[];
    pending?: string;
    history: [string, string][];
    pendingSourceDocs?: Document[];
  }>({
    messages: [
      {
        message: "I am AI Assistant. How may I serve you today?",
        type: "apiMessage",
      },
    ],
    history: [],
  });

  const { messages, history } = messageState;

  const messageListRef = useRef<HTMLDivElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textAreaRef.current?.focus();

  }, []);

  //handle form submission
  async function handleSubmit(e: any) {
    e.preventDefault();

    setError(null);

    if (!query) {
      alert("Please input a question");
      return;
    }

    const question = query.trim();

    setMessageState((state) => ({
      ...state,
      messages: [
        ...state.messages,
        {
          type: "userMessage",
          message: question,
        },
      ],
    }));

    setLoading(true);
    setQuery("");

    try {
      const message: Message = {
        type: "apiMessage",
        message: "",
        isStreaming: true,
        sourceDocs: [],
      };

      //const history = [...messageState.history, [question, message.message]];

      setMessageState((state) => ({
        ...state,
        messages: [...state.messages, message],
        //history: [...state.history, [question, message.message]],
      }));

      fetchEventSource("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question,
        }),
        onmessage: (event) => {
          setLoading(false);
          if (event.data === "DONE") {
            // Complete
          } else {
            // Stream text
            message.message = message.message + event.data;
            setMessageState((state) => ({
              ...state,
              messages: [...state.messages],
              history: [...state.history],
            }));
          }
        },
        onerror: (error) => {
          setLoading(false);
          setError(
            "An error occurred while fetching the data. Please try again."
          );
          console.log("error", error);
        },
        openWhenHidden: true,
      });
      messageListRef.current?.scrollTo(0, messageListRef.current.scrollHeight);

      setLoading(false);
    } catch (error) {
      setLoading(false);
      setError("An error occurred while fetching the data. Please try again.");
      console.log("error", error);
    }
  }

  //prevent empty submissions
  const handleEnter = (e: any) => {
    if (e.key === "Enter" && query) {
      handleSubmit(e);
    } else if (e.key == "Enter") {
      e.preventDefault();
    }
  };

  return (
    <>
      <div className="mx-auto flex flex-col gap-4">
        <main className={styles.main}>
          <div className={styles.cloud}>
            <div ref={messageListRef} className={styles.messagelist}>
              {messages.map((message, index) => {
                let icon;
                let className;
                if (message.type === "apiMessage") {
                  icon = (
                    <Image
                      key={`${index} + ${message}`} 
                      src="/bot-image.png"
                      alt="AI"
                      width="40"
                      height="40"
                      className={styles.boticon}
                      priority
                    />
                  );
                  className = styles.apimessage;
                } else {
                  icon = (
                    <Image
                      key={index}
                      src="/usericon.png"
                      alt="Me"
                      width="30"
                      height="30"
                      className={styles.usericon}
                      priority
                    />
                  );
                  // The latest message sent by the user will be animated while waiting for a response
                  className =
                    loading && index === messages.length - 1
                      ? styles.usermessagewaiting
                      : styles.usermessage;
                }
                return (
                  <>
                    <div key={`chatMessage-${index}`} className={className}>
                      {icon}
                      <div className={styles.markdownanswer}>
                        <ReactMarkdown
                          linkTarget="_blank"
                          // allowDangerousHtml
                          // plugins={[html]}
                        >
                          {message.message}
                        </ReactMarkdown>
                      </div>
                    </div>
                    {message.sourceDocs && (
                      <div className="p-5" key={`sourceDocsAccordion-${index}`}>
                        <Accordion
                          type="single"
                          collapsible
                          className="flex-col"
                        >
                          {message.sourceDocs.map((doc, index) => {
                            // Extract file name from path
                            const pathParts = doc.metadata.source.split("/");
                            let fileName = pathParts[pathParts.length - 1];
                            // Remove extension and replace hyphens with spaces
                            fileName = fileName
                              .split(".")[0]
                              .replace(/-/g, " ");

                            // If page number is available in metadata, append it
                            const pageNumber = doc.metadata.pageNumber
                              ? ` {page ${doc.metadata.pageNumber}}`
                              : "";

                            return (
                              <div key={`messageSourceDocs-${index}-${pageNumber}`}>
                                <AccordionItem value={`item-${index}`}>
                                  <AccordionTrigger>
                                    <h3>Source {index + 1}</h3>
                                  </AccordionTrigger>
                                  <AccordionContent>
                                    <ReactMarkdown
                                      linkTarget="_blank"
                                      //allowDangerousHtml
                                      //plugins={[html]}
                                    >
                                      {doc.pageContent}
                                    </ReactMarkdown>
                                    <p className="mt-2">
                                      <b>Source:</b> {fileName + pageNumber}
                                    </p>
                                  </AccordionContent>
                                </AccordionItem>
                              </div>
                            );
                          }
                          )}
                        </Accordion>
                      </div>
                    )}
                  </>
                );
              })}
            </div>
          </div>
          <div className={styles.center}>
            <div className={styles.cloudform}>
              <form onSubmit={handleSubmit}>
                <textarea
                  disabled={loading}
                  onKeyDown={handleEnter}
                  ref={textAreaRef}
                  autoFocus={false}
                  rows={4}
                  maxLength={2048}
                  id="userInput"
                  name="userInput"
                  placeholder={
                    loading
                      ? "Thinking..."
                      : "Ask your question"
                  }
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className={styles.textarea}
                />
                <button
                  type="submit"
                  disabled={loading}
                  className={styles.generatebutton}
                >
                  {loading ? (
                    <div className={styles.loadingwheel}>
                      <LoadingDots color="#000" />
                    </div>
                  ) : (
                    // Send icon SVG in input field
                    <svg
                      viewBox="0 0 20 20"
                      className={styles.svgicon}
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path>
                    </svg>
                  )}
                </button>
              </form>
            </div>
          </div>
          {error && (
            <div className="border border-red-400 rounded-md p-4">
              <p className="text-red-500">{error}</p>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
