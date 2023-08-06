import { Outlet } from "react-router-dom";
import Header from "../static/Header";
import { styled } from "styled-components";

const Layout = () => {
  return (
    <Main>
      <Header />
      <Container>
        <Outlet />
      </Container>
    </Main>
  );
};

export default Layout;

const Main = styled.div`
  width: 100%;
  min-height: 100vh;
  display: flex;
  justify-content: flex-end;
  background-color: var(--appBG);
`;

const Container = styled.div`
  width: calc(100% - 200px);
  display: flex;
  padding-top: 30px;
  padding-bottom: 30px;
`;
