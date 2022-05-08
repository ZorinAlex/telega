import axios from 'axios';

function getAddress() {
  if (process.env.NODE_ENV === 'production') {
    return '188.166.95.7';
  }
  return 'localhost';
}

export default axios.create({
  baseURL: `http://${getAddress()}:5000/telega`,
  headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
});

export const authRequest = axios.create({
  baseURL: `http://${getAddress()}:5000/auth`,
  headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
});

export const locationRequest = axios.create({
  baseURL: `http://${getAddress()}:3000/location`,
  headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
});

export const channelsRequest = axios.create({
  baseURL: `http://${getAddress()}:4000/data`,
  headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
});
