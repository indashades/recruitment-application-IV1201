export function RecoverView(props) {
    
    function log(){props.onChange();}
    
    return (
        <div>
    <div>
    <h1>Recover password step 1/2</h1>
    </div>
    <div><input 

type="text"
value={props.usernameV}
placeholder="username or email"
onChange={props.doUsername}

/>
</div>
<button onClick={log}>submit</button>
    </div>
    );
  }