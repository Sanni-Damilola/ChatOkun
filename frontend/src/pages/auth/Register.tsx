import React, { useState } from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import pix from "../../assets/bukky.jpg";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../../api/AuthAPI";

const Register = () => {
  const navigate = useNavigate();
  const [image, setImage] = useState(pix);
  const [avatar, setAvatar] = useState("");

  const schema = yup.object({
    email: yup.string().required(),
    userName: yup.string().required(),
    password: yup.string().required(),
    confirm: yup.string().oneOf([yup.ref("password")]),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onHandleImage = (e: any) => {
    try {
      const file = e.target.files[0];
      const realImage = URL.createObjectURL(file);
      setImage(realImage);
      setAvatar(file);
    } catch (error) {
      console.log(error);
    }
  };

  const onHandleSubmit = handleSubmit(async (data: any) => {
    const { userName, email, password } = data;

    registerUser({ userName, email, password }).then(() => {
      navigate("/sign-in");
    });
  });

  return (
    <Container>
      <Main onSubmit={onHandleSubmit}>
        <Title>Register as Author</Title>
        <ImageHolder>
          <Image src={image} />
          <ImageInput id="pix" type="file" onChange={onHandleImage} />
          <ImageLabel htmlFor="pix">Upload Image</ImageLabel>
        </ImageHolder>

        <InputHolder>
          <InputTitle>User Name</InputTitle>
          <Input placeholder="User Name" {...register("userName")} />
        </InputHolder>
        {errors.userName && <Error>Error</Error>}

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

        <InputHolder>
          <InputTitle>Confirm</InputTitle>
          <Input placeholder="Confirm" {...register("confirm")} />
        </InputHolder>
        {errors.password && <Error>Error</Error>}

        <Button type="submit">Register</Button>

        <Holder>
          <Line />
          <LineText>Already have an Account</LineText>
          <Line />
        </Holder>
        <Button2 to="/sign-in">Sign in</Button2>
      </Main>
    </Container>
  );
};

export default Register;

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

const ImageLabel = styled.label`
  padding: 8px 15px;
  border-radius: var(--appRadiusSmall);
  background-color: var(--appText);
  color: var(--appBG);
  font-size: 12px;
  margin-top: 4px;
  cursor: pointer;
`;

const Image = styled.img`
  width: 70px;
  height: 70px;
  border-radius: 50%;
  border: 1px solid var(--appBorder);
  object-fit: cover;
  margin: 5px 0;
`;

const ImageInput = styled.input`
  display: none;
`;

const ImageHolder = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
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
