import axios from 'axios';

export default axios.create({
  baseURL: 'http://localhost:5000/telega/',
  headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
});
