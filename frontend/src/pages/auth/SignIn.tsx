import styled from "styled-components";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { signinAuthor } from "../../api/AuthAPI";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { createUser } from "../../global/globalState";

const SignIn = () => {
  const dispatch = useDispatch();

  const navigate = useNavigate();

  const schema = yup.object({
    email: yup.string().required(),
    password: yup.string().required(),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onHandleSubmit = handleSubmit(async (data: any) => {
    const { email, password } = data;

    signinAuthor({ email, password }).then((res) => {
      dispatch(createUser(res));
      navigate("/");
    });
  });

  return (
    <div>
      <Container>
        <Main onSubmit={onHandleSubmit}>
          <Title>Sign in as Author</Title>

          <InputHolder>
            <InputTitle>Email</InputTitle>
            <Input placeholder="Email" {...register("email")} />
          </InputHolder>
          {errors.email && <Error>Error</Error>}

          <InputHolder>
            <InputTitle>Password</InputTitle>
            <Input placeholder="Password" {...register("password")} />
          </InputHolder>
          {errors.password && <Error>Error</Error>}

          <Button type="submit">Sign in</Button>

          <Holder>
            <Line />
            <LineText>Don't have an Account</LineText>
            <Line />
          </Holder>
          <Button2 to="/register">Sign up</Button2>
        </Main>
      </Container>
    </div>
  );
};

export default SignIn;

const Title = styled.div`
  margin-bottom: 20px;
  font-weight: 600;
`;

const LineText = styled.div`
  text-transform: uppercase;
  font-size: 10px;
  margin: 0 6px;
  width: 100%;
  text-align: center;
  line-height: 1.2;
`;

const Line = styled.div`
  width: 100%;
  border-bottom: 1px solid;
  border-color: var(--appBorder);
`;

const Holder = styled.div`
  display: flex;
  width: 90%;
  align-items: center;
  margin-bottom: 20px;
`;

const Button2 = styled(Link)`
  width: 90%;
  background-color: var(--appAuth);
  color: var(--appBG);
  height: 43px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 10px 0;
  border-radius: var(--appRadiusSmall);
  text-decoration: none;
`;

const Button = styled.button`
  width: 90%;
  background-color: var(--appMainColor);
  color: var(--appBG);
  height: 43px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 10px 0;
  border-radius: var(--appRadiusSmall);
  font-size: 15px;
  font-family: Poppins;
  outline: none;
  border: 0;
`;

const Error = styled.div`
  font-size: 10px;
  color: #53012e;
  font-weight: bold;
  text-align: right;
  width: 90%;
  margin-bottom: 7px;
`;

const Input = styled.input`
  background-color: var(--appBG);
  border: 0;
  outline: none;
  width: 95%;
  height: 95%;
  padding-left: 10px;
`;

const InputTitle = styled.div`
  background-color: var(--appBG);
  margin: 0 10px;
  position: absolute;
  top: -10px;
  left: 0;
  font-size: 12px;
`;

const InputHolder = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  width: 90%;
  height: 40px;
  border: 1px solid var(--appBorderL);
  border-radius: var(--appRadiusSmall);
  margin: 10px 0;
`;

const Main = styled.form`
  width: 300px;
  min-height: 400px;
  border: 1px solid var(--appBorder);
  border-radius: var(--appRadiusSmall);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 0;
`;

const Container = styled.div`
  width: 100vw;
  height: 100vh;
  background-color: var(--appBG);
  color: var(--appText);
  display: flex;
  justify-content: center;
  align-items: center;
`;
