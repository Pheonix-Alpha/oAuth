import { useState, useRef, useEffect } from "react";
import axios from "axios";
import logo from "../assets/logo.png";

export default function SignupPage() {
  const [showOtp, setShowOtp] = useState(false);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  const otpInputRef = useRef(null);

  useEffect(() => {
    if (showOtp && otpInputRef.current) {
      otpInputRef.current.focus();
    }
  }, [showOtp]);

  // Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!name || !dob || !email) {
      alert("Fill all fields before requesting OTP!");
      return;
    }
    try {
      setLoading(true);
      const res = await axios.post(
        "https://oauth-8kph.onrender.com/api/auth/signup/request-otp",
        { name, dob, email }
      );
      const otp = res.data.otp; // get OTP from response
      alert(`${res.data.message} ✅\nYour OTP: ${otp}`);
      setShowOtp(true);
    } catch (err) {
      alert(err.response?.data?.msg || "Error sending OTP ❌");
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP and create account
  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await axios.post(
        "https://oauth-8kph.onrender.com/api/auth/signup/verify-otp",
        { name, dob, email, otp }
      );

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("name", res.data.user.name); // <-- add this
      localStorage.setItem("email", res.data.user.email);

      alert("Signup successful 🎉");
      window.location.href = "/dashboard";
    } catch (err) {
      alert(err.response?.data?.msg || "Invalid OTP ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen flex justify-center">
      <div className="max-w-screen w-full grid grid-cols-1 md:grid-cols-12">
        {/* Left Section */}
        <div className="col-span-1 md:col-span-4 bg-white rounded-2xl py-3">
          <img
            src={logo}
            alt="Logo"
            className="h-6 px-4 block mx-auto md:mx-0 md:ml-0"
          />

          <div className="px-7 pb-4 md:py-8">
            <h2 className="text-3xl font-bold mt-4 mb-3 text-center">
              Sign up
            </h2>
            <p className="text-gray-400 mb-3 text-center md:text-left">
              Sign up to enjoy the feature of HD
            </p>

            <form
              className="space-y-4"
              onSubmit={showOtp ? handleSignup : handleSendOtp}
            >
              {/* Name */}
              <div className="relative">
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder=" "
                  required
                  className="peer w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
                />
                <label
                  htmlFor="name"
                  className={`absolute left-3 text-sm transition-all bg-white px-1
                    ${
                      name
                        ? "top-0 text-xs text-blue-500"
                        : "top-1/2 -translate-y-1/2 text-gray-400 peer-focus:top-0 peer-focus:text-xs peer-focus:text-blue-500"
                    }`}
                >
                  Name
                </label>
              </div>

              {/* Date of Birth */}
              <div className="relative">
                <input
                  type="date"
                  id="dob"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  placeholder=" "
                  required
                  className="peer w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
                />
                <label
                  htmlFor="dob"
                  className={`absolute left-3 text-sm transition-all bg-white px-1
                    ${
                      dob
                        ? "top-0 text-xs text-blue-500"
                        : "top-1/2 -translate-y-1/2 text-gray-400 peer-focus:top-0 peer-focus:text-xs peer-focus:text-blue-500"
                    }`}
                >
                  Date of Birth
                </label>
              </div>

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

              {/* OTP */}
              {showOtp && (
                <div className="relative">
                  <input
                    ref={otpInputRef}
                    type="text"
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
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {loading ? "Sending..." : "Get OTP"}
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-500 transition disabled:opacity-50"
                >
                  {loading ? "Verifying..." : "Sign Up"}
                </button>
              )}
              <div className="flex items-center my-4">
                <div className="flex-grow h-px bg-gray-300"></div>
                <span className="px-2 text-gray-400 text-sm">OR</span>
                <div className="flex-grow h-px bg-gray-300"></div>
              </div>

              {/* Google Signup Button */}
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() =>
                    (window.location.href =
                      "https://oauth-8kph.onrender.com/api/auth/google/")
                  }
                  className="w-full   md:w-auto flex items-center justify-center gap-2 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition"
                >
                  <img
                    src="https://www.svgrepo.com/show/355037/google.svg"
                    alt="Google"
                    className="h-5 w-5"
                  />
                  Sign up with Google
                </button>
                </div>
             
            </form>

            {/* Already have an account */}
            <p className="text-gray-600 text-center mt-6">
              Already have an account?{" "}
              <a href="/" className="text-blue-600 font-medium hover:underline">
                Sign in
              </a>
            </p>
          </div>
        </div>

        {/* Right Section */}
        <div className="hidden md:flex md:col-span-8 bg-blue-600 text-white rounded-xl shadow min-h-screen items-center justify-center">
          <h1 className="text-4xl font-bold">Welcome to Our Platform 🚀</h1>
        </div>
      </div>
    </section>
  );
}
