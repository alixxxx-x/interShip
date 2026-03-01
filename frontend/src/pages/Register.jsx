import { useState } from "react";
import api from "../services/api";
import { useNavigate, Link } from "react-router-dom";

function Register() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            await api.post("/auth/register/", { username, email, password });
            alert("Registration successful! Please login.");
            navigate("/login");
        } catch (error) {
            alert("Registration failed");
        }
    };

    return (
        <div className="flex h-screen overflow-hidden font-['Inter',system-ui,sans-serif]">

            <div className="relative flex-1 basis-1/2 min-w-0 overflow-hidden">
            </div>
        </div>




    );
}

export default Register;
