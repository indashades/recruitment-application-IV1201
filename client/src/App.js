// App.js
import { Routes, Route, Navigate } from "react-router-dom";
import StartView from "./view/StartView";

export default function App() {
  return (
    <Routes>
      <Route path="/start" element={<StartView />} />
      <Route path="*" element={<Navigate to="/start" replace />} />
    </Routes>
  );
}
