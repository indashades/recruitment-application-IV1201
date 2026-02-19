export function RecruitView(props) {
    
   
    function searching(){props.onSearch();}
    
    return (
        <div>
    <div>
    <h1>view applicants</h1>
    </div>
    <div><input 

type="text"
value={props.search}
placeholder="search"
onChange={props.p1}

/>
<select name="choose status" id="status"  value={props.status}
        onChange={props.p2}>
  <option value="unhandled">any</option>
  <option value="accepted">accepted</option>
  <option value="rejected">rejected</option>
  <option value="unhandled">unhandled</option>
</select>

{/*test to be removed*/}
<button onClick={searching}>search</button>


</div>

<div>
                
                {props.model.applications.map((app, index) => (
                    <div key={index} style={{ border: "1px solid #ccc", margin: "5px", padding: "5px" }}
                    onClick={() => props.p3(app.applicationId)}
                    >
                        <p><strong>ID:</strong> {app.applicationId}</p>
                        <p><strong>Name:</strong> {app.fullName}</p>
                        <p><strong>Status:</strong> {app.status}</p>
                        <p><strong>Submission Date:</strong> {app.submissionDate}</p>
                    </div>
                ))}
            </div>
    </div>
    );
  }