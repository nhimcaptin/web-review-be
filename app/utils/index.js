const CONST_STATUS = {
  SUSCCESS: 200,
  PERMISSION: 401,
  ERORRUSER: 400,
  ERRORSERVER: 500,
};

const CONST_MESSAGE = {};

const returnResponse = (res, status, body) => {
  return res.status(status).json({ status, ...body });
};

const capitalizeFirstLetter = (string) => {
  if (!string) return "";
  return string.charAt(0).toUpperCase() + string.slice(1);
};

const convertData = (data) => {
  const obj = {};
  Object.keys(data).forEach((item) => {
    if (typeof data[item] === "object" && !!data[item] && !Array.isArray(data[item])) {
      Object.keys(data[item]).forEach((_item) => {
        obj[`${item}${capitalizeFirstLetter(_item)}`] = data[item][_item];
      });
    } else {
      obj[item] = data[item];
    }
  });
  return obj;
};

const convertDataArray = (data) => {
  const obj = {};
  Object.keys(data).forEach((item) => {
    if (item === "image_urls") {
      obj[item] = JSON.parse(data[item]);
    } else {
      obj[item] = data[item];
    }
  });
  return obj;
};
module.exports = {
  CONST_STATUS,
  CONST_MESSAGE,
  returnResponse,
  capitalizeFirstLetter,
  convertData,
  convertDataArray,
};
