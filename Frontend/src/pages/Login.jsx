import { Eye, EyeOff, MessageSquare } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../store/slices/authSlice";
import { toast } from "react-toastify";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formdata, setFormdata] = useState({ email: "", password: "" });
  const { isLoggingIn } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formdata.email || !formdata.password) {
      toast.error("Please fill in all fields");
      return;
    }

    dispatch(login(formdata))
      .unwrap()
      .then(() => {
        toast.success("Logged in successfully");
        navigate("/"); 
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || "Login failed");
      });
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-white">
      {/* Form side */}
      <div className="flex flex-col justify-center items-center px-6 py-12">
        <div className="w-full max-w-md text-center">
          <div className="bg-blue-100 p-4 rounded-2xl inline-flex items-center justify-center">
            <MessageSquare className="text-blue-600 w-8 h-8" />
          </div>

          <h1 className="text-3xl font-extrabold mt-6 text-gray-900">Welcome Back</h1>
          <p className="mt-3 text-lg text-gray-600">Sign in to your account</p>

          <form className="mt-8 space-y-6 text-left" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email address</label>
              <input
                type="email"
                required
                placeholder="Enter your email"
                value={formdata.email}
                onChange={(e) => setFormdata({ ...formdata, email: e.target.value })}
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 px-4 py-2"
              />
            </div>

            <div className="relative mt-4 w-full">
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formdata.password}
                  onChange={(e) => setFormdata({ ...formdata, password: e.target.value })}
                  required
                  className="mt-1 block w-full rounded-lg border border-gray-300 shadow-sm px-4 py-2 pr-10 focus:outline-none focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                <span
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-5 h-5 text-gray-500" /> : <Eye className="w-5 h-5 text-gray-500" />}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between mt-2">
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <span className="text-sm text-gray-600">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-sm font-medium text-blue-600 hover:underline">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow hover:bg-blue-700 transition"
              disabled={isLoggingIn}
            >
              {isLoggingIn ? "Signing In..." : "Sign In"}
            </button>

            <p className="mt-4 text-sm text-center text-gray-600">
              Don’t have an account?{" "}
              <Link to="/register" className="text-blue-600 font-medium hover:underline">
                Sign Up
              </Link>
            </p>
          </form>
        </div>
      </div>

      {/* Right side welcome */}
      <div className="hidden lg:flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-blue-600">Welcome to BuzzChat</h2>
          <h3 className="text-xl font-medium text-blue-500 mt-2">Sign in to Continue</h3>
        </div>
      </div>
    </div>
  );
};

export default Login;
