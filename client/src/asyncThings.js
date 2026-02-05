
import { request, setToken } from "./api";

export async function login(username, password) {
  if (!username || !password) {
    console.log("this shouldnt be possible")
  }

  const data = await request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password })
  });

  // Persist token (model concern)
  setToken(data.token);
  localStorage.setItem("authToken", data.token);
  console.log(data.role);

  return {
    role: data.role
  };
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
export async function register(username, password,firstName,lastName,email,personnummer) {
    if (!username || !password || !firstName || !lastName || ! email || ! personnummer) {
      console.log("this shouldnt be possible")
    }
  
    const data = await request("/auth/register", {
      method: "POST",
      body: JSON.stringify({ username, password,firstName,lastName,email,personnummer })
    });
  
    // Persist token (model concern)
    setToken(data.token);
    localStorage.setItem("authToken", data.token);
    console.log(data.role);
  
    return {
      role: data.role
    };
  }
