export function StartView(props) {
    
    function logreg(){props.onChange();}
    function vi(){props.viewAppl();}
    function appl(){props.apply();}
    
    return (
        <div>
    <div>
    <h1>welcome</h1>
    </div>
    <div><button style={{marginRight: 20}} onClick={logreg}>Register/Login</button></div>
    <div><button style={{marginRight: 20}} onClick={vi}>view applicants</button></div>
    <div><button style={{marginRight: 20}} onClick={appl}>apply for the job</button></div>
    </div>
    );
  }