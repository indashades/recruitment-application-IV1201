export /*default*/ function ApplyView(props) {
    
    function log(){props.onChange();}
    function can(){props.onChange2();}
    
    return (
        <div>
    <div>
    <h1>Apply for job</h1>
    </div>
    <div><input 

type="text"
value={props.avalablefrom}
placeholder="Avalable from"
onChange={props.doPW}

/>
<input 

type="text"
value={props.avalableto}
placeholder="Avalable to"
onChange={props.doUsername}

/></div>

{/*
<select name="choose competence" id="competence">
  <option value="">--Please choose an option--</option>
  <option value="ticket sales">ticket sales</option>
  <option value="lotteris">lotteries</option>
  <option value="roller coaster operation">roller coaster operation</option>
</select>*/}
<div className="wider">
<input 
type="text"
value={props.yearsTicket}
placeholder="experience written as years in ticket sales"
onChange={props.appl1}
/></div>
<div className="wider">
<input 
type="text"
value={props.yearsLotteries}
placeholder="experience written as years in lotteries work"
onChange={props.appl2}
/></div>
<div className="wider">
<input 
type="text"
value={props.yearsRoller}
placeholder="experience written as years in roller coaster operation"
onChange={props.appl3}
/></div>
<div>
<button onClick={can}>cancel</button>
<button onClick={log}>submit</button>
</div>
    </div>
    );
  }