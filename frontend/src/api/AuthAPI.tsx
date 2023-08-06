import axios from "axios";

const url: string = "http://localhost:8899/api/v2";

export const registerUser = async (data: any) => {
  try {
    const config: {} = {
      "content-type": "multipart/form-data",
    };
    return await axios
      .post(`${url}/create-user`, data, config)
      .then((res: any) => {
        return res.data.data;
      });
  } catch (error) {
    console.log(error);
  }
};

export const signinAuthor = async (data: any) => {
  try {
    return await axios.post(`${url}/sign-in-user`, data).then((res: any) => {
      console.log(res);
      return res.data.data;
    });
  } catch (error) {
    console.log(error);
  }
};

export const getOneUser = async (userID: string) => {
  try {
    return await axios
      .get(`${url}/${userID}/get-one-author`)
      .then((res: any) => {
        return res.data.data;
      });
  } catch (error) {
    console.log(error);
  }
};

export const getUser = async () => {
  try {
    return await axios.get(`${url}/get-user`).then((res: any) => {
      return res.data.data;
    });
  } catch (error) {
    console.log(error);
  }
};
