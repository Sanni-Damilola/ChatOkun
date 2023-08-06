import styled from "styled-components";

const CardContainer = styled.div`
  border: 1px solid #ccc;
  padding: 16px;
  border-radius: 8px;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;

  & > * {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
  }

  p {
    margin: 0;
    margin-right: 8px;
  }
`;

const Username = styled.h2`
  margin: 0;
`;

const Email = styled.p`
  margin: 4px 0;
  color: #555;
`;

const FriendsCount = styled.p`
  margin: 4px 0;
  color: #888;
`;
const Wrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  width: 100%;
  justify-content: center;
  height: fit-content;
`;

interface User {
  username: string;
  email: string;
  friendsCount: number;
}

const generateUsers = (count: number): User[] => {
  const users: User[] = [];

  for (let i = 0; i < count; i++) {
    users.push({
      username: `User${i + 1}`,
      email: `user${i + 1}@example.com`,
      friendsCount: Math.floor(Math.random() * users.length),
    });
  }

  return users;
};

const users: User[] = generateUsers(100);

const AllUsers = () => {
  return (
    <Wrapper>
      {users.map((user, index) => (
        <CardContainer key={index}>
          <div>
            <p>Username:</p>
            <Username>{user.username}</Username>
          </div>
          <div>
            <p>Email:</p>
            <Email>{user.email}</Email>
          </div>
          <div>
            <p>Friends:</p>
            <FriendsCount>{user.friendsCount}</FriendsCount>
          </div>
        </CardContainer>
      ))}
    </Wrapper>
  );
};

export default AllUsers;
