import axios from 'axios';

export default axios.create({
  baseURL: 'http://localhost:5000/telega/',
  headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
});

export const locationRequest = axios.create({
  baseURL: 'http://localhost:3000/location/',
  headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
});
