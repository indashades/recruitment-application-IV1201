import { RegisterView } from "../view/RegisterView";
import { observer } from "mobx-react-lite";
import "../i18n";
import { useTranslation } from "react-i18next"; 

const Register = observer(            
    
    //Registering med: first name as name1 {string}, last name as name2 {string}, person number as pnr {string} and email address as mail {string}

    function RegisterRender(model){
        const { t, i18n } = useTranslation();
        
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
            
                if(pw==null){alert(t("pwmis"));}
                else if(username==null){alert(t("miss3"));}
                else if(pnr==null){alert(t("fere"));}
                else if(name1==null){alert(t("miss2"));}
                else if(name2==null){alert(t("miss"));}
                else if(mail==null){alert(t("misas"));}
                else if (!(mail.includes(".") && mail.includes("@"))){alert(t("invm"));}
                else if (username.length<3){alert(t("usern3"));}
                else if (pw.length<8){alert(t("morest"));}
                else if (pw.length>99 || username.length>99||name1>99||name2>99||mail>99){alert(t("imposs"))}
                else if (!(pnr.length==12||pnr.length==10||(pnr.length==11 && pnr.includes("-")==6)||(pnr.length==13&&pnr.includes("-")==8)))
                    {alert(t("inp"));}
                


                else
                {
                    if (await model.model.registrering(pnr,name1,name2,mail,pw,username)==1)
                    {alert(t("transfail"));}//temp ska flyttas men då jag inte kan testa saker så gör jag den här snabbt}
                    await model.model.loggaIn(username,pw);
                }
                if (model.model.loggedin===1)
                {
                    alert(t("successlog"));
                    window.location.hash = model.model.wantedPage;
                }
                
                
          }
          
        
        
        

        return <RegisterView    onChange={changeRegOrLog} pnra={pnra} usernamea={usernamea} pwa={pwa} name1a={name1a} name2a={name2a} maila={maila}  />;
        
    }
);


export { Register };
    