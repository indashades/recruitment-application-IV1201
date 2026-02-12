export function LoginView(props) {
    
    function log(){props.onChange();}
    
    return (
        <div>
    <div>
    <h1>login</h1>
    </div>
    <div><input 

type="text"
value={props.usernameV}
placeholder="username"
onChange={props.doUsername}

/>
<input 

type="password"
value={props.passwordV}
placeholder="Password"
onChange={props.doPW}

/></div>
<button onClick={log}>submit</button>
    </div>
    );
  }