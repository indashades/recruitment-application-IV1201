import { Recover2View } from "../view/Recover2View";
import { observer } from "mobx-react-lite";
import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import "../i18n";
import { useTranslation } from "react-i18next"; 

/**
 * Presenter component for step 2 of account recovery.
 * Reads the recovery token from the URL, validates the new password,
 * submits the password reset via the app model, and passes UI state to `Recover2View`.
 *
 * @param {{ model: { rec2: (token: string, password: string) => Promise<any> } }} model
 * @returns {JSX.Element}
 */
const Recover2 = observer(            
    // Step 2: set a new password using the recovery token from the URL
    

    function Recover2Render(model){
        const { t, i18n } = useTranslation();
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
                setErrorMessage(t("w1"));
                setSuccessMessage("");
            }
            else if (!pw || pw.length<8){
                setErrorMessage(t("w2"));
                setSuccessMessage("");
            } else{
                try{
                setLoading(true);
                setErrorMessage("");
                await model.model.rec2(recoveryToken,pw)
                
                window.location.hash = "#/";
                setSuccessMessage(t("w3"));
                }
                catch{
                    setSuccessMessage("");
                    setErrorMessage(t("w4"));
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
    