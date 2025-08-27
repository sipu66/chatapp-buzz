import { useState } from "react";
import { Link } from "react-router-dom";
import { MessageSquare } from "lucide-react"; // or remove if not using

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);

    // Fake request: pretend we sent a reset link
    setTimeout(() => {
      setSubmitting(false);
      setDone(true);
      setEmail("");
    }, 1200);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow p-8">
        <div className="flex flex-col items-center">
          <div className="bg-blue-100 p-4 rounded-2xl inline-flex items-center justify-center">
            <MessageSquare className="text-blue-600 w-8 h-8" />
          </div>
          <h1 className="text-2xl font-extrabold mt-6 text-gray-900">
            Forgot Password
          </h1>
          <p className="mt-2 text-sm text-gray-600 text-center">
            Enter your email. We’ll send a confirmation email to reset your password.
          </p>
        </div>

        {!done ? (
          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 px-4 py-2"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? "Sending..." : "Send reset link"}
            </button>

            <div className="text-center">
              <Link to="/" className="text-sm font-medium text-blue-600 hover:underline">
                Back to Sign In
              </Link>
            </div>
          </form>
        ) : (
          <div className="mt-8 text-center">
            <div className="inline-block bg-green-50 border border-green-200 rounded-lg px-4 py-3">
              <p className="text-sm text-green-700" aria-live="polite">
                If an account exists for that email, a reset link has been sent.
              </p>
            </div>

            <div className="mt-6">
              <Link to="/" className="text-sm font-medium text-blue-600 hover:underline">
                Return to Sign In
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
