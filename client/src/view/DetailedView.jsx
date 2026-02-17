export function DetailedView(props) {
    
   
    function searching(){props.onSearch();}
    
    return (
        <div>
    <div>
    <h1>view applicant</h1>
    </div>
    <div>
<select name="choose status" id="status"  value={props.status}
        onChange={props.p2}>
  <option value="1">any</option>
  <option value="2">accepted</option>
  <option value="3">rejected</option>
  <option value="4">unhandled</option>
</select>

{/*to be displayed is


"data": {
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


</div>

<div>
                
            
            
            </div>
    </div>
    );
  }