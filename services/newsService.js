const axios = require('axios');

exports.fetchNews = async (category, country = 'cd', pageSize = 20) => {
  try {
    const url = `https://newsapi.org/v2/top-headlines?country=${country}&category=${category}&pageSize=${pageSize}&apiKey=${process.env.NEWS_API_KEY}`;
    const response = await axios.get(url);
    return response.data.articles;
  } catch (err) {
    console.error('Erreur récupération actualités', err);
    return [];
  }
};