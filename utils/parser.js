//Parses and sanitises data from incoming response body
const parser = async (dataObj) => {
  const rawData = await dataObj;

  try {
    const data = await rawData
      .toString()
      .replace(/[!#$^&%*()+=/|<>?\\-]/g, "")
      .trim();
    return data;
  } catch (err) {
    return {};
  }
};

module.exports = parser;
