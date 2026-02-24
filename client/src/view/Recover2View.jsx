export function Recover2View(props) {
    
    function log(){props.onChange();}
    
    return (
        <div>
    <div>
    <h1>Set new password</h1>
    </div>
    <div><input 

type="password"
value={props.passwordV}
placeholder="new Password"
onChange={props.doPW}

/></div>
<button onClick={log}>submit</button>
    </div>
    );
  }