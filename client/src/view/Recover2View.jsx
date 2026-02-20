export function Recover2View(props) {
    
    function log(){props.onChange();}
    
    return (
        <div>
    <div>
    <h1>recover password step 2/2</h1>
    </div>
    <div><input 

type="text"
value={props.usernameV}
placeholder="recovery token"
onChange={props.doUsername}

/>
<input 

type="password"
value={props.passwordV}
placeholder="new Password"
onChange={props.doPW}

/></div>
<button onClick={log}>submit</button>
    </div>
    );
  }