import { RecoverView } from "../view/RecoverView";
import { observer } from "mobx-react-lite";
import { useState } from "react";

/**
 * Presenter component for step 1 of account recovery.
 * Collects a username/email identifier, performs basic validation,
 * triggers the recovery-email request via the app model, and passes UI state to `RecoverView`.
 *
 * @param {{ model: { rec1: (identifier: string) => Promise<any> }, [key: string]: any } | { model: { rec1: (identifier: string) => Promise<any> } }} model
 * @returns {JSX.Element}
 */
const Recover = observer(            
    // Step 1: request a password recovery link using username or email
    

    function RecoverRender(model){
        const [username, setUsername] = useState("");
        const [loading, setLoading] = useState(false);
        const [errorMessage, setErrorMessage] = useState("");
        const [successMessage, setSuccessMessage] = useState("");

        function ura(p){
            setUsername(p.target.value);
            if (errorMessage) setErrorMessage("");
        }

        function goBack() {
            window.location.hash = "#/Log";
        }
        async function changeRegOrLog() {
            const identifier = (username || "").trim();
            if(identifier.length < 3){
                setErrorMessage("Enter at least 3 characters (username or email).");
                setSuccessMessage("");
            }
            else{
                try{
                    setLoading(true);
                    setErrorMessage("");
                    await model.model.rec1(identifier);
                    setSuccessMessage("If the account exists, a recovery email has been sent. Please check your inbox and spam folder.");
                }
                catch{
                    setSuccessMessage("");
                    setErrorMessage("We couldn't send the recovery email right now. Please try again.");
                }
                finally{
                    setLoading(false);
                }
            }
          }
          
        return <RecoverView
          onChange={changeRegOrLog}
          doUsername={ura}
          usernameV={username}
          loading={loading}
          errorMessage={errorMessage}
          successMessage={successMessage}
          onBack={goBack}
        />;
        
    }
);

export { Recover };
    