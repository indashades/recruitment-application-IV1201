
import { request, setToken, token } from "./api";


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
  console.log(data.token);
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

  
export async function submitApplication(competences, availability) {
  if (!competences || competences.length === 0) {
    alert("shouldnt be possible")
    return; 
  }
  if (!availability || availability.length === 0) {
    alert("shouldnt be possible")
    return;
  }

  const data = await request("/applications", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ competences, availability })
  });

  // data contains applicationId, status, submissionDate, version
  return data;
}


export async function getApplications(sortKey = "submissionDate", direction = "desc") {
  const query = new URLSearchParams({
    sortKey,
    direction
  }).toString();

  const data = await request(`/applications?${query}`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  });
}
/*
export async function getApplications(search, status) {
  

  const data = await request("/applications", {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ competences, availability })
  });

  // data contains applicationId, status, submissionDate, version
  return data;
}*/

