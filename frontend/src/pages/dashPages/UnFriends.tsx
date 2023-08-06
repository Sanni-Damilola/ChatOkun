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
  background-color: var(--appText);
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

const UnFriends = () => {
  // You can adjust the number of friends here
  const numberOfFriends = 100;
  const [friends, setFriends] = useState<Friend[]>(
    generateFriends(numberOfFriends)
  );

  const handleAddFriend = (friendUsername: string) => {
    alert(`${friendUsername} as been Deleted From Your friends List!`);
  };

  return (
    <Wrapper>
      {friends.map((friend, index) => (
        <CardContainer
          key={index}
          onClick={() => handleAddFriend(friend.username)}
        >
          <h2>Delete Friend</h2>
          <Username>{friend.username}</Username>
          <Email>{friend.email}</Email>
          <AddButton>UnFriend</AddButton>
        </CardContainer>
      ))}
    </Wrapper>
  );
};

export default UnFriends;
