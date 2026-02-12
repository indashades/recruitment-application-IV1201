import { ApplyView } from "../view/ApplyView";
import { observer } from "mobx-react-lite";

const Apply = observer(            
    /*apply for job with availability as avalablefrom {string} and avalableto {string} 
    * and years of experience in the different areas as yearsTicket {number}, yearsLotteries {number} and yearsRoller {number}
    */
    

    function ApplyRender(model){
        let avalablefrom=null;
        let avalableto=null;
        let yearsTicket=null;
        let yearsLotteries=null;
        let yearsRoller=null;
        function pwa(p){avalablefrom=p.target.value;}
        function ura(p){avalableto=p.target.value;}
        function ura1(p){yearsTicket=p.target.value;}
        function ura2(p){yearsLotteries=p.target.value;}
        function ura3(p){yearsRoller=p.target.value;}
        async function applybutton() {
                
                if (model.model.loggedin===1)
                    {
                        
                        await model.model.application(avalablefrom,avalableto,yearsTicket,yearsLotteries,yearsRoller);
                    }
                else
                {
                    alert("you are not logged in");
                    window.location.hash = "#/";
                }
          }
          function cancelbutton(){window.location.hash = "#/";}
          
          
        
        
        

        return <ApplyView   onChange={applybutton} onChange2={cancelbutton} doPW={pwa} doUsername={ura} appl1={ura1}
         appl2={ura2} appl3={ura3} />;
        
    }
);

export { Apply };
    