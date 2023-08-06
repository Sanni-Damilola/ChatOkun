import React, { useState } from "react";
import styled from "styled-components";

const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
  width: 100%;
`;

const ChatBox = styled.div`
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 16px;
  width: 80%;
  max-width: 100%;
  height: 400px;
  overflow-y: scroll;
`;

const MessageContainer = styled.div<{ isFriend: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: ${({ isFriend }) => (isFriend ? "flex-end" : "flex-start")};
  margin-bottom: 8px;
`;

const Message = styled.div`
  padding: 8px;
  border-radius: 8px;
  background-color: #f0f0f0;

  strong {
    margin-right: 5px;
  }
`;

const InputContainer = styled.div`
  display: flex;
  align-items: center;
  margin-top: 16px;
  width: 83%;
`;

const Input = styled.input`
  flex: 1;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const SendButton = styled.button`
  background-color: var(--appMainColor);
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  margin-left: 8px;
  cursor: pointer;
`;

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<any>([]);
  const [inputText, setInputText] = useState("");

  const handleSendMessage = (sender: string) => {
    if (inputText.trim() !== "") {
      setMessages([...messages, { text: inputText, sender }]);
      setInputText("");
    }
  };

  return (
    <ChatContainer>
      <h1>Chat with Friend</h1>
      <ChatBox>
        {messages.map((message: any, index: number) => (
          <MessageContainer key={index} isFriend={message.sender === "Friend"}>
            <Message>
              {message.sender === "Me" && <strong>Me:</strong>}
              {message.sender === "Friend" && <strong>Friend:</strong>}
              {message.text}
            </Message>
          </MessageContainer>
        ))}
      </ChatBox>
      <InputContainer>
        <Input
          type="text"
          placeholder="Type your message..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />
        <SendButton onClick={() => handleSendMessage("Me")}>Send</SendButton>
        <SendButton onClick={() => handleSendMessage("Friend")}>
          Send as Friend
        </SendButton>
      </InputContainer>
    </ChatContainer>
  );
};

export default Chat;
