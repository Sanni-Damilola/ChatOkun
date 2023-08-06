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

const AcceptButton = styled.button`
  background-color: var(--appRed);
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  cursor: pointer;
  margin-right: 10px;
`;

const RejectButton = styled.button`
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

interface FriendRequest {
  username: string;
}

const generateRequests = (count: number): FriendRequest[] => {
  const requests: FriendRequest[] = [];

  for (let i = 0; i < count; i++) {
    requests.push({
      username: `User${i + 1}`,
    });
  }

  return requests;
};

const ViewRequest = () => {
  // You can adjust the number of requests here
  const numberOfRequests = 5;

  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>(
    generateRequests(numberOfRequests)
  );

  const handleAccept = (username: string) => {
    alert(`Accepted friend request from ${username}`);
  };

  const handleReject = (username: string) => {
    alert(`Rejected friend request from ${username}`);
  };

  return (
    <Wrapper>
      {friendRequests.map((request, index) => (
        <CardContainer key={index}>
          <h2>Friend Request</h2>
          <Username>{request.username}</Username>
          <AcceptButton onClick={() => handleAccept(request.username)}>
            Accept
          </AcceptButton>
          <RejectButton onClick={() => handleReject(request.username)}>
            Reject
          </RejectButton>
        </CardContainer>
      ))}
    </Wrapper>
  );
};

export default ViewRequest;
