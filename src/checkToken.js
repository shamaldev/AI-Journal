import {jwtDecode} from 'jwt-decode';
export default function checkToken(token) {
  try {
    const decodedToken = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    return decodedToken.exp < currentTime;
  } catch (error) {
    return true; // Treat as expired if decoding fails
  }
}