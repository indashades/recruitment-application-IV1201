import { RegisterView } from "../view/RegisterView";
import { observer } from "mobx-react-lite";

const Register = observer(            
    
    //Registering med: first name as name1 {string}, last name as name2 {string}, person number as pnr {string} and email address as mail {string}

    function RegisterRender(model){
        
        let pw=null;
        let username=null;
        let pnr=null;
        let name1=null;
        let name2=null;
        let mail=null;
        function pnra(p){pnr=p.target.value;}
        function usernamea(p){username=p.target.value;}
        function pwa(p){pw=p.target.value;}
        function name1a(p){name1=p.target.value;}
        function name2a(p){name2=p.target.value;}
        function maila(p){mail=p.target.value;}
        async function changeRegOrLog() {
            
                if(pw==null){alert("missing password");}
                else if(username==null){alert("missing username");}
                else if(pnr==null){alert("missing person number");}
                else if(name1==null){alert("missing first name");}
                else if(name2==null){alert("missing last name");}
                else if(mail==null){alert("missing mail address");}
                else if (!(mail.includes(".") && mail.includes("@"))){alert("invalid mail address");}
                else if (username.length<3){alert("username must be at least 3 letters");}
                else if (pw.length<8){alert("password must be at least 8 letters");}
                else if (pw.length>99 || username.length>99||name1>99||name2>99||mail>99){alert("strings are too long")}
                else if (!(pnr.length==12||pnr.length==10||(pnr.length==11 && pnr.includes("-")==6)||(pnr.length==13&&pnr.includes("-")==8)))
                    {alert("invalid personnumber");}
                


                else
                {
                    await model.model.registrering(pnr,name1,name2,mail,pw,username);
                    await model.model.loggaIn(username,pw);
                }
                if (model.model.loggedin===1)
                {
                    alert("log in successful");
                    window.location.hash = model.model.wantedPage;
                }
                
                
          }
          
        
        
        

        return <RegisterView    onChange={changeRegOrLog} pnra={pnra} usernamea={usernamea} pwa={pwa} name1a={name1a} name2a={name2a} maila={maila}  />;
        
    }
);

export { Register };
    