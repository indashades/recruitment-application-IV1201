export function RegorlogView(props) {
    
    function log(){props.log1();}
    function reg(){props.reg1();}
    function rec(){props.rec1();}
    
    return (
        <div>
    <div>
    <h1>register or login</h1>
    </div>
    <div><button style={{marginRight: 20}} onClick={log}>log in</button>
    <button style={{marginRight: 20}} onClick={reg}>register</button>
    <button style={{marginRight: 20}} onClick={rec}>recover account</button></div>
    </div>
    );
  }