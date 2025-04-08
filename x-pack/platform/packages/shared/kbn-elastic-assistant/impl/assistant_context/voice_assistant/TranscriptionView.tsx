import * as React from "react";
import useCombinedTranscriptions from "./useCombinedTranscriptions";

export default function TranscriptionView() {
  const combinedTranscriptions = useCombinedTranscriptions();

  // Scroll to bottom when new transcription is added
  React.useEffect(() => {
    const transcription = combinedTranscriptions[combinedTranscriptions.length - 1];
    if (transcription) {
      const transcriptionElement = document.getElementById(transcription.id);
      if (transcriptionElement) {
        transcriptionElement.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [combinedTranscriptions]);

  const containerStyle = {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
    overflowY: "auto",
    color: "white",
    padding: "1rem",
    width: 300
  } as const;

  const assistantStyle = {
    backgroundColor: "#2d2d2d",
    borderRadius: "0.375rem",
    padding: "0.5rem",
    alignSelf: "flex-start",
    maxWidth: 250,
  } as const;

  const userStyle = {
    backgroundColor: "#2d2d2d",
    borderRadius: "0.375rem",
    padding: "0.5rem",
    alignSelf: "flex-end",
    maxWidth: 250,

  } as const;

  console.log(combinedTranscriptions)
  return (
    <div style={containerStyle}>
      {combinedTranscriptions.map((segment) => (
        <div
          id={segment.id}
          key={segment.id}
          style={segment.role === "assistant" ? assistantStyle : userStyle}
        >
          {segment.text}
        </div>
      ))}
    </div>
  );
}
