
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