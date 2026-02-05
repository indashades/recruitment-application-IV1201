
import { request, setToken } from "./api";

export async function register(username,pw,name1,name2,mail,numb) {
  return request("/auth/register", {
    method: "POST",
    body: JSON.stringify(username,pw,name1,name2,mail,numb)
  });
}
/*
{
  "username": "username",
  "password": "password",
  "firstName": "FName",
  "lastName": "LName",
  "email": "email@example.com",
  "personnummer": "199001011234"
}
  */

export async function login(username, password) {
  const data = await request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password })
  });

  setToken(data.token);
  return data;
}

export function getCurrentUser() {
  return request("/auth/me");
}
