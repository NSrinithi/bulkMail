import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    function handleLogin() {
        if (!username || !password) {
            alert("Please enter username and password");
            return;
        }

        axios.get('http://localhost:3000/login', {
            params: {
                username: username,
                password: password
            }
        })
        .then((response) => {
            if (response.data === "Login successful") {
                alert("Login successful");
                navigate('/index');
            } else {
                alert("Invalid username or password");
            }
        })
        .catch((error) => {
            console.error(error);
            alert("Login failed. Please try again.");
        });
    }

    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">

            <div className="w-full max-w-md">

                {/* Logo / App Name */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl shadow-lg mb-4">
                        <span className="text-3xl">✉️</span>
                    </div>

                    <h1 className="text-3xl font-bold text-slate-800">
                        Bulk Mailer
                    </h1>

                    <p className="text-slate-500 mt-2">
                        Send emails to multiple recipients with ease
                    </p>
                </div>


                {/* Login Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8">

                    <h2 className="text-2xl font-semibold text-slate-800 mb-2">
                        Welcome back
                    </h2>

                    <p className="text-slate-500 mb-6">
                        Login to access your mail dashboard
                    </p>


                    {/* Username */}
                    <div className="mb-5">
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Username
                        </label>

                        <input
                            type="text"
                            placeholder="Enter your username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-4 py-3 border border-slate-300 rounded-lg 
                                       outline-none focus:ring-2 focus:ring-blue-500 
                                       focus:border-blue-500 transition"
                        />
                    </div>


                    {/* Password */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Password
                        </label>

                        <input
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    handleLogin();
                                }
                            }}
                            className="w-full px-4 py-3 border border-slate-300 rounded-lg 
                                       outline-none focus:ring-2 focus:ring-blue-500 
                                       focus:border-blue-500 transition"
                        />
                    </div>


                    {/* Login Button */}
                    <button
                        onClick={handleLogin}
                        className="w-full bg-blue-600 text-white py-3 rounded-lg 
                                   font-semibold hover:bg-blue-700 
                                   active:scale-[0.98] transition duration-200 
                                   shadow-md"
                    >
                        Login
                    </button>

                </div>


                {/* Footer */}
                <p className="text-center text-sm text-slate-400 mt-6">
                    Bulk Mailer Application
                </p>

            </div>
        </div>
    );
}

export default Login;