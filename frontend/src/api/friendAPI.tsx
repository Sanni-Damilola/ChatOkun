import axios from "axios";

const url: string = "http://localhost:3344/api/v1";

export const beFriend = async (userID: string, friendID: string) => {
  try {
    return await axios
      .post(`${url}/${userID}/${friendID}/be-friend`)
      .then((res: any) => {
        return res.data.data;
      });
  } catch (error) {
    console.log(error);
  }
};

export const makeRequest = async (userID: string, friendID: string) => {
  try {
    return await axios
      .post(`${url}/${userID}/${friendID}/make-request`)
      .then((res: any) => {
        console.log(res);
        return res.data.message;
      });
  } catch (error) {
    console.log(error);
  }
};

export const deleteRequest = async (userID: string, friendID: string) => {
  try {
    return await axios
      .post(`${url}/${userID}/${friendID}/delete-request`)
      .then((res: any) => {
        return res.data.data;
      });
  } catch (error) {
    console.log(error);
  }
};

export const viewRequest = async (userID: string) => {
  try {
    return await axios.get(`${url}/${userID}/view-request`).then((res: any) => {
      return res.data.data;
    });
  } catch (error) {
    console.log(error);
  }
};
