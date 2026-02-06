export /*default*/ function RecruitView(props) {
    
    function log(){props.onChange();}
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
onChange={props.doPW}

/>
<select name="choose status" id="status">
  <option value="1">any</option>
  <option value="2">accepted</option>
  <option value="3">rejected</option>
  <option value="4">unhandled</option>
</select>

{/*test*/}
<button onClick={log}>testCreateApplicants</button>
<button onClick={searching}>search</button>


</div>
{/*here we map them*/}
<div>
                {/* Map applications here */}
                {props.model.applications.map((app, index) => (
                    <div key={index} style={{ border: "1px solid #ccc", margin: "5px", padding: "5px" }}>
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