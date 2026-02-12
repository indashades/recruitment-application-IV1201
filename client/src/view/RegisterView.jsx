export function RegisterView(props) {
    
    function regg()
    {
        props.onChange();
        
    }
    
    
    return (
        <div>
    <div>
    <h1>register</h1>
    </div>
    <div><input 

type="text"
value={props.username}
placeholder="username"
onChange={props.usernamea}

/>
<input 

type="password"
value={props.pw}
placeholder="Password"
onChange={props.pwa}

/></div>
<div><input 

type="text"
value={props.mail}
placeholder="E-mail address"
onChange={props.maila}

/>
<input 

type="text"
value={props.name1}
placeholder="first name"
onChange={props.name1a}

/>
<input 

type="text"
value={props.name2}
placeholder="last name"
onChange={props.name2a}

/></div>
<div>
<input 

type="text"
value={props.pnr}
placeholder="person number"
onChange={props.pnra}

/>
</div>
<button onClick={regg}>submit</button>
    </div>
    );
  }