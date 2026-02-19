



export function DetailedView(props) {
    
   
    function searching(){props.onSearch();}
    
    return (
        <div>
    <div>
    <h1>view applicant</h1>
    </div>
    <div>
        
<select name="choose status" id="status"  value={props.model.application.status}
        onChange={props.p2}>
  <option value="any">any</option>
  <option value="accepted">accepted</option>
  <option value="rejected">rejected</option>
  <option value="unhandled">unhandled</option>
</select>
</div>

{/*to be displayed is


"application": {
    "applicationId": 10,
    "status": "unhandled",
    "submissionDate": "2026-02-02",
    "version": 1,
    "person": {
      "personId": 1,
      "firstName": "FName",
      "lastName": "LName",
      "email": "email@example.com"
    },
    "competences": [
      {
        "competenceId": 1,
        "code": "JAVA",
        "name": "Java",
        "yearsOfExperience": 5.5
      }
    ],
    "availability": [
      { "fromDate": "2026-01-01", "toDate": "2026-06-30" }
    ]
     */}


  
    <div>
      

      

      {/* BASIC INFO */}
      <h2>Application Info</h2>
      <p><strong>ID:</strong> {props.model.application.applicationId}</p>
      <p><strong>Submission Date:</strong> {props.model.application.submissionDate}</p>
      <p><strong>Version:</strong> {props.model.application.version}</p>

      {/* PERSON */}
      <h2>Person</h2>
      <p><strong>First Name:</strong> {props.model.application.person.firstName}</p>
      <p><strong>Last Name:</strong> {props.model.application.person.lastName}</p>
      <p><strong>Email:</strong> {props.model.application.person.email}</p>

      {/* COMPETENCES */}
      <h2>Competences</h2>
      {props.model.application.competences.map((comp) => (
        <div key={comp.competenceId}>
          <p><strong>Name:</strong> {comp.name}</p>
          <p><strong>Code:</strong> {comp.code}</p>
          <p><strong>Years of Experience:</strong> {comp.yearsOfExperience}</p>
          <hr />
        </div>
      ))}

      {/* AVAILABILITY */}
      <h2>Availability</h2>
      {props.model.application.availability.map((period, index) => (
        <div key={index}>
          <p><strong>From:</strong> {period.fromDate}</p>
          <p><strong>To:</strong> {period.toDate}</p>
        </div>
      ))}
    </div>
    </div>
  );
}

























