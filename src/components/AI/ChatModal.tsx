// components/ChatModal.tsx
import { Box, Dialog, DialogContent, IconButton, InputAdornment, TextField, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
import { useEffect, useRef, useState } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
  files?: string[];
}

interface ChatModalProps {
  open: boolean;
  onClose: () => void;
  onSendMessage: (messages: Message[]) => Promise<string>;
}

export const ChatModal = ({ open, onClose, onSendMessage }: ChatModalProps) => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", content: input };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);
    try {
      const reply = await onSendMessage(updatedMessages);
      const iaMessage: Message = { role: "assistant", content: reply };
      setMessages((prev) => [...prev, iaMessage]);
    } catch (e) {
      setMessages((prev) => [...prev, { role: "assistant", content: "Error al responder." }]);
    } finally {
      setLoading(false);
    }
  };

  function extractImageUrlsFromMarkdown(content: string): string[] {
    const matches = [...content.matchAll(/\[.*?\]\((.*?)\)/g)];
    return matches.map((m) => m[1]).filter((url) => url.startsWith("http") && /\.(jpg|jpeg|png|webp|gif)$/i.test(url));
  }

  function removeMarkdownLinks(content: string): string {

    return content
      .replace(/\[.*?\]\((.*?)\)/g, "")
      .replace(/\s{2,}/g, " ")
      .trim();
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 2, pt: 2 }}>
        <Typography variant="h6">💬 Simulador de Chat</Typography>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>
      <DialogContent
        sx={{
          bgcolor: "#121212",
          height: 500,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box sx={{ flex: 1, overflowY: "auto", p: 1 }}>
          {messages.map((msg, index) => (
            <Box
              key={index}
              sx={{
                display: "flex",
                justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                mb: 1,
              }}
            >
              <Box>
                <Box
                  sx={{
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    bgcolor: msg.role === "user" ? "#6c47ff" : "#2f2f2f",
                    color: "white",
                    maxWidth: "80%",
                    fontSize: "15px",
                  }}
                >
                  {msg.role === "assistant" ? removeMarkdownLinks(msg.content) : msg.content}
                </Box>
                {[
                  ...(msg.files || []),
                  ...(msg.role === "assistant" ? extractImageUrlsFromMarkdown(msg.content) : []),
                ].map((url, i) => (
                  <Box key={i} sx={{ mt: 1 }}>
                    <img src={url} alt={`img-${i}`} style={{ maxWidth: 200, borderRadius: 8 }} />
                  </Box>
                ))}
              </Box>
            </Box>
          ))}
          <div ref={bottomRef} />
        </Box>
        <Box sx={{ mt: 1 }}>
          <TextField
            fullWidth
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Escribe un mensaje..."
            disabled={loading}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={handleSend} disabled={loading}>
                    <SendIcon sx={{ color: "#6c47ff" }} />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              bgcolor: "#1e1e1e",
              borderRadius: 2,
              input: { color: "white" },
            }}
          />
        </Box>
      </DialogContent>
    </Dialog>
  );
};
