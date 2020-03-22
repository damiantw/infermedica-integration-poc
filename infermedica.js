const axios = require("axios");

exports.diagnosis = async (payload) => {
  return await send("POST", "diagnosis", payload);
};

exports.triage = async (payload) => {
  return await send("POST", "triage", payload);
};

const send = async (method, endpoint, data) => {
  const response = await axios.request({
    url: `https://api.infermedica.com/covid19/${endpoint}`,
    headers: {
      "Content-Type": "application/json",
      "App-Id": process.env.APP_ID,
      "App-Key": process.env.APP_KEY,
    },
    method,
    data,
  });
  return response.data;
};
