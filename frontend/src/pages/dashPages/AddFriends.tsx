import { useState } from "react";
import styled from "styled-components";

const CardContainer = styled.div`
  border: 1px solid #ccc;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-align: center;
`;

const Username = styled.p`
  margin: 8px 0;
  font-weight: bold;
`;

const Email = styled.p`
  margin: 4px 0;
  color: #555;
`;

const AddButton = styled.button`
  background-color: var(--appMainColor);
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  cursor: pointer;
`;

const Wrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  width: 100%;
  justify-content: center;
  height: fit-content;
`;

// Snackbar styled component
const Snackbar = styled.div<{ show: any }>`
  position: fixed;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #333;
  color: white;
  padding: 8px 16px;
  border-radius: 4px;
  display: ${(props) => (props.show ? "block" : "none")};
`;

interface Friend {
  username: string;
  email: string;
}

const generateFriends = (count: number): Friend[] => {
  const friends: Friend[] = [];

  for (let i = 0; i < count; i++) {
    friends.push({
      username: `Friend${i + 1}`,
      email: `friend${i + 1}@example.com`,
    });
  }

  return friends;
};

const AddFriend: React.FC = () => {
  // You can adjust the number of friends here
  const numberOfFriends = 100;
  const [friends] = useState<Friend[]>(generateFriends(numberOfFriends));

  const [snackbarMessage, setSnackbarMessage] = useState<string>("");

  const handleAddFriend = (friendUsername: string) => {
    const message = `Adding ${friendUsername} as a friend!`;
    setSnackbarMessage(message);
    setTimeout(() => {
      setSnackbarMessage("");
    }, 5000);
  };

  return (
    <Wrapper>
      {friends.map((friend, index) => (
        <CardContainer
          key={index}
          onClick={() => handleAddFriend(friend.username)}
        >
          <h2>Add Friend</h2>
          <Username>{friend.username}</Username>
          <Email>{friend.email}</Email>
          <AddButton>Add Friend</AddButton>
        </CardContainer>
      ))}
      <Snackbar show={snackbarMessage !== ""}>{snackbarMessage}</Snackbar>
    </Wrapper>
  );
};

export default AddFriend;
