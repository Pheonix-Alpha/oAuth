import { useState, useRef, useEffect } from "react";
import axios from "axios";
import logo from "../assets/logo.png";
import { Eye, EyeOff } from "lucide-react";

export default function Signin() {
  const [showOtp, setShowOtp] = useState(false);
  const [showOtpValue, setShowOtpValue] = useState(false);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const otpInputRef = useRef(null);

  useEffect(() => {
    if (showOtp && otpInputRef.current) {
      otpInputRef.current.focus();
    }
  }, [showOtp]);

  // Request OTP
  const handleSendOtp = async () => {
    if (!email) {
      alert("Enter email first!");
      return;
    }
    try {
      setLoading(true);
      const res = await axios.post(
        "https://oauth-8kph.onrender.com/api/auth/signin/request-otp",
        { email }
      );
     const otp = res.data.otp; // now it will have the OTP
alert(`${res.data.message} ✅\nYour OTP: ${otp}`);

      setShowOtp(true); // ✅ show OTP input
    } catch (err) {
      alert(err.response?.data?.msg || "Error sending OTP ❌");
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP
  const handleSignin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await axios.post(
        "https://oauth-8kph.onrender.com/api/auth/signin/verify-otp",
        { email, otp }
      );

      // ✅ Save token to localStorage
       localStorage.setItem("token", res.data.token);
    localStorage.setItem("name", res.data.user.name);   // <-- add this
    localStorage.setItem("email", res.data.user.email);

      alert("Signin successful 🚀");
      window.location.href = "/dashboard"; // redirect
    } catch (err) {
      alert(err.response?.data?.msg || "Invalid OTP ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen flex justify-center">
      <div className="max-w-screen w-full grid grid-cols-1 md:grid-cols-12">
        {/* Left Section (Login Form) */}
        <div className="col-span-1 md:col-span-4 bg-white rounded-2xl py-3">
          {/* Logo */}
          <img
            src={logo}
            alt="Logo"
            className="h-6 px-4 block mx-auto md:mx-0 md:ml-0"
          />

          <div className="px-7 pb-4 md:py-8">
            <h2 className="text-3xl font-bold mt-4 mb-3 text-center">Sign in</h2>
            <p className="text-gray-400 mb-3 text-center md:text-left">
              Please login to continue to your account.
            </p>

            <form className="space-y-4" onSubmit={handleSignin}>
              {/* Email */}
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder=" "
                  required
                  className="peer w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
                />
                <label
                  htmlFor="email"
                  className={`absolute left-3 text-sm transition-all bg-white px-1
                    ${
                      email
                        ? "top-0 text-xs text-blue-500"
                        : "top-1/2 -translate-y-1/2 text-gray-400 peer-focus:top-0 peer-focus:text-xs peer-focus:text-blue-500"
                    }`}
                >
                  Email
                </label>
              </div>

              {/* OTP (shown only after request) */}
              {showOtp && (
                <div>
                  <div className="relative">
                    <input
                      ref={otpInputRef}
                      type={showOtpValue ? "text" : "password"}
                      id="otp"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder=" "
                      required
                      className="peer w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
                    />
                    <label
                      htmlFor="otp"
                      className={`absolute left-3 text-sm transition-all bg-white px-1
                        ${
                          otp
                            ? "top-0 text-xs text-blue-500"
                            : "top-1/2 -translate-y-1/2 text-gray-400 peer-focus:top-0 peer-focus:text-xs peer-focus:text-blue-500"
                        }`}
                    >
                      OTP
                    </label>
                    {/* Eye Icon */}
                    <button
                      type="button"
                      onClick={() => setShowOtpValue(!showOtpValue)}
                      className="absolute right-3 top-2 text-gray-500 hover:text-gray-700"
                    >
                      {showOtpValue ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {/* Resend OTP */}
                  <div className="text-left mt-1">
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Resend OTP
                    </button>
                  </div>
                </div>
              )}

              {/* Buttons */}
              {!showOtp ? (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {loading ? "Sending..." : "Get OTP"}
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                >
                  {loading ? "Verifying..." : "Sign In"}
                </button>
              )}
              {/* Google Signup Button */}
<button
  type="button"
  onClick={() =>
    (window.location.href = "https://oauth-8kph.onrender.com/api/auth/google/")
  }
  className="w-full flex items-center justify-center gap-2 bg-blue-300 text-white py-2 rounded-lg hover:bg-gray-600 transition"
>
  <img
    src="https://www.svgrepo.com/show/355037/google.svg"
    alt="Google"
    className="h-5 w-5"
  />
  Sign up with Google
</button>
            </form>
             {/* Already have an account */}
            <p className="text-gray-600 text-center mt-6">
              Nead an account?{" "}
              <a href="/signup" className="text-blue-600 font-medium hover:underline">
                Create one
              </a>
            </p>
          </div>
        </div>

        {/* Right Section */}
        <div className="hidden md:flex md:col-span-8 bg-blue-600 text-white rounded-xl shadow min-h-screen items-center justify-center">
          <h1 className="text-4xl font-bold">Welcome Back 🚀</h1>
        </div>
      </div>
    </section>
  );
}
