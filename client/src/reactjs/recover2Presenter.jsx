import { Recover2View } from "../view/Recover2View";
import { observer } from "mobx-react-lite";
import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";

const Recover2 = observer(            
    //login with username {string} and password {string}
    

    function Recover2Render(model){
        const [searchParams] = useSearchParams();
        const recoveryToken = searchParams.get("token") || "";

        const [pw, setPw] = useState("");
        const [loading, setLoading] = useState(false);
        const [errorMessage, setErrorMessage] = useState("");
        const [successMessage, setSuccessMessage] = useState("");

        useEffect(() => {
            // Scrub token from the visible URL after it has been ingested
            if (recoveryToken && window.location.hash.includes("token=")) {
                const cleanUrl = `${window.location.pathname}${window.location.search}#/__recover`;
                window.history.replaceState(null, "", cleanUrl);
            }
        }, [recoveryToken]);

        function pwa(p){
            setPw(p.target.value);
            if (errorMessage) setErrorMessage("");
        }

        function goHome() {
            window.location.hash = "#/";
        }

        function requestNewLink() {
            window.location.hash = "#/rec1";
        }

        async function changeRegOrLog() {
            if(!recoveryToken){
                setErrorMessage("This recovery link is missing a token. Please request a new recovery email.");
                setSuccessMessage("");
            }
            else if (!pw || pw.length<8){
                setErrorMessage("Password must be at least 8 characters.");
                setSuccessMessage("");
            } else{
                try{
                setLoading(true);
                setErrorMessage("");
                await model.model.rec2(recoveryToken,pw)
                
                window.location.hash = "#/";
                setSuccessMessage("Password updated successfully. You can now continue to the application.");
                }
                catch{
                    setSuccessMessage("");
                    setErrorMessage("This recovery link is invalid or expired. Please request a new recovery email.");
                }
                finally{
                    setLoading(false);
                }
            }
          }
          
        return <Recover2View
          onChange={changeRegOrLog}
          doPW={pwa}
          passwordV={pw}
          hasToken={Boolean(recoveryToken)}
          loading={loading}
          errorMessage={errorMessage}
          successMessage={successMessage}
          onBack={goHome}
          onRequestNewLink={requestNewLink}
        />;        
    }
);

export { Recover2 };
    