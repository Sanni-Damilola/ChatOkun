import { ChangeEvent, useMemo, useState } from "react";
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
  align-items: center;
  height: 100vh;
`;

const SearchBar = styled.input`
  width: 80%;
  font-size: inherit;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  margin-bottom: 16px;
`;

const Container = styled.div`
  width: 100%;
`;

interface User {
  username: string;
  email: string;
  friendsCount: number;
}

const AllUsers = () => {
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
  const users = useMemo(() => generateUsers(100), []);

  const [searchQuery, setSearchQuery] = useState<string>("");

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const filteredUsers = useMemo(() => {
    return users.filter(
      (user) =>
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [users, searchQuery]);

  return (
    <Container>
      <div
        style={{
          display: "flex",
          width: "80%",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <SearchBar
          maxLength={20}
          type="text"
          placeholder="Search users..."
          value={searchQuery}
          onChange={handleSearchChange}
        />
      </div>
      <Wrapper>
        {filteredUsers.length === 0 ? (
          <p>
            <b>{searchQuery}</b> Not found.
          </p>
        ) : (
          filteredUsers.map((user, index) => (
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
          ))
        )}
      </Wrapper>
    </Container>
  );
};

export default AllUsers;
