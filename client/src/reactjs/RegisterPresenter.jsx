import { RegisterView } from "../view/RegisterView";
import { observer } from "mobx-react-lite";

const Register = observer(            
    
    //Registering med: first name, last name, person number and email address

    function RegisterRender(model){//model
        
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
                

                else
                {
                    await model.model.registrering(pnr,name1,name2,mail,pw,username);
                }
                if (model.model.loggedin===1)
                {
                    alert("log in successful");
                    window.location.hash = model.model.wantedPage;
                }
                //window.location.hash = "#/RegOrLog";
                //denna bestämmer
          }
          
        
        
        

        return <RegisterView /* mayhaps the functions? */   onChange={changeRegOrLog} pnra={pnra} usernamea={usernamea} pwa={pwa} name1a={name1a} name2a={name2a} maila={maila}  />;
        
    }
);

export { Register };
    