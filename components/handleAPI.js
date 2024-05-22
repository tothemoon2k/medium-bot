require("dotenv").config();
const axios = require("axios");

const acquireUserDetails = async (token) => {

  try {
    const res = await axios.get("/v1/me", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
        "Accept-Charset": "utf-8",
      },
      baseURL: "https://api.medium.com",
    })

    return(res.data);
  } catch (error) {
    return(error.response.data);
  }
};

const sampleInput = {
  userDetails: {
    userId: "",
    token: ""
  },
  title: "Hi, I'm a title",
  content: "<h1>Liverpool FC</h1><p>You'll never walk alone.</p>",
  tags: ["football", "sport", "Liverpool"],
}

const postViaAPI = async (userDetails, title, content, tags) => {
  try {
    const res = await axios.post(`/v1/users/${userDetails.userId}/posts`,
      {
        title: title,
        contentFormat: "html",
        content: content,
        tags: tags,
        publishStatus: "public",
      },
      {
        headers: {
          Authorization: `Bearer ${userDetails.token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
          "Accept-Charset": "utf-8",
        },
        baseURL: "https://api.medium.com",
      }
    )

    return(res.data);
  } catch (error) {
    return(error.data);
  }
};

module.exports = {postViaAPI};
