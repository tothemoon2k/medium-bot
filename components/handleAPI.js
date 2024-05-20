require("dotenv").config();
const axios = require("axios");

const acquireUserDetails = () => {
  axios.get("/v1/me", {
    headers: {
      Authorization: `Bearer ${process.env.MEDIUM_TOKEN}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      "Accept-Charset": "utf-8",
    },
    baseURL: "https://api.medium.com",
  })
  .then((response) => {
    console.log(response.data);
  })
  .catch((error) => {
    console.error(error.response.data);
  });
};

const sampleInput = {
  userDetails: {
    userId: "1d96c06a77f6dadd6e6ea0c0c5efa95e0f08e32aa807b91bee6e88a778fd839af",
    token: ""
  },
  title: "Hi, I'm a title",
  content: "<h1>Liverpool FC</h1><p>You'll never walk alone.</p>",
  tags: ["football", "sport", "Liverpool"],
}

const postViaAPI = (userDetails, title, content, tags) => {
  axios
    .post(
      `/v1/users/1d96c06a77f6dadd6e6ea0c0c5efa95e0f08e32aa807b91bee6e88a778fd839af/posts`, ///v1/users/${userDetails.userId}/posts
      {
        title: title,
        contentFormat: "html",
        content: content,
        tags: tags,
        publishStatus: "public",
      },
      {
        headers: {
          Authorization: `Bearer`, //Bearer ${userDetails.token}
          "Content-Type": "application/json",
          Accept: "application/json",
          "Accept-Charset": "utf-8",
        },
        baseURL: "https://api.medium.com",
      }
    )
    .then((response) => {
      console.log(response.data.data);
    })
    .catch((error) => {
      console.error(error.response.data);
    });
};

postViaAPI(sampleInput.userDetails, sampleInput.title, sampleInput.content, sampleInput.tags);

module.exports = {postViaAPI};
