
import { request, setToken, token } from "./api";

/*login function
* @param username {string}
* @param password {string}
* @return sets token and returns the role
*/
export async function login(username, password) {
  if (!username || !password) {
    console.log("this shouldnt be possible")
  }

  const data = await request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password })
  });

  setToken(data.token);
  console.log(data.token);
  console.log(data.role);

  return {
    role: data.role
  };
}
/*login function
* @param username {string}
* @param password {string}
* @param firstName {string}
* @param lastName {string}
* @param email {string}
* @param personnummer {string}
* @return returns the role (may not actually set token hence why i chain it with login where it is used )
*/
export async function register(username, password,firstName,lastName,email,personnummer) {
    if (!username || !password || !firstName || !lastName || ! email || ! personnummer) {
      console.log("this shouldnt be possible")
    }
  
    const data = await request("/auth/register", {
      method: "POST",
      body: JSON.stringify({ username, password,firstName,lastName,email,personnummer })
    });
  
    setToken(data.token);
    localStorage.setItem("authToken", data.token);
    console.log(data.role);
  
    return {
      role: data.role
    };
  }

  /*submit application
  * @param competences {class and array} competences contains competenceId {number} and yearsOfExperience {number} 3 of each
  * @availability {class} contains fromDate {string} and toDate {string} which detail when applicant is applying for
  * @return nothing, it sends the application to database 
  */
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

  return data;
}

/*get applications
* @param status {string} accepted, rejected or unhandled
* @param fullName {string} what is actually searched by
* @returns applications {class} for contains see model 
*/
export async function getApplications(status, fullName) {
  const query = new URLSearchParams({
    status,
    fullName
  }).toString();

  const data = await request(`/applications?${query}`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  });
  return data;
}

//`GET /applications/:id`

export async function getApplication(id) {
  

  const data = await request(`/applications/${id}`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  });
  return data;
}

export async function editAppStatus(id,status,version) {
  
//`PATCH /applications/:id/status`
  const data = await request(`/applications/${id}/status`, {
    method: "PATCH",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ status,version })
  });
  return data;
}

export async function sendRec1(identifier) {
  
  //`PATCH /applications/:id/status`
    const data = await request(`/auth/recovery/request`, {
      method: "POST",
      body: JSON.stringify({ identifier })
    });
    return data;
  }

export async function sendRec2(token,newPassword) {
  
  //`PATCH /applications/:id/status`
    const data = await request(`/auth/recovery/confirm`, {
      method: "POST",
      body: JSON.stringify({ token,newPassword })
    });
    if (data?.token) {
      setToken(data.token);
      localStorage.setItem("authToken", data.token);
    }
    return data;
  }