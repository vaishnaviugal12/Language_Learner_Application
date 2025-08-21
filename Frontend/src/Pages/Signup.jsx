import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router"; // Fixed import
import { useDispatch, useSelector } from "react-redux"; // Added
import { registerUser } from "../authSlice"; // Fixed trailing comma

const topicsList = [
  "Travel",
  "Food",
  "Sports",
  "Movies",
  "Technology",
  "Business",
  "Culture",
  "Daily Life",
];

const schema = z.object({
  username: z.string().min(1, "Username is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  nativeLanguage: z.string().min(1, "Please select your native language"),
  learningLanguage: z.string().min(1, "Please enter learning languages"),
  knownLanguage: z.string().min(1, "Please enter known languages"),
  topicsOfInterest: z.array(z.string()).optional(),
  callDurationPreference: z.string().optional(),
});

function Signup() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      topicsOfInterest: [],
    },
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = (data) => {
    dispatch(registerUser(data));
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-900 px-4">
      <div className="bg-gray-800 p-8 rounded-lg w-full max-w-lg shadow-lg">
        <h1 className="text-3xl font-bold text-center text-white mb-6">Sign Up</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Username */}
          <div>
            <label className="block text-white mb-1">Username</label>
            <input
              type="text"
              {...register("username")}
              className={`w-full p-3 rounded bg-gray-700 text-white outline-none ${
                errors.username ? "border border-red-500" : ""
              }`}
              placeholder="Enter username"
            />
            {errors.username && (
              <p className="text-red-500 text-sm">{errors.username.message}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-white mb-1">Email</label>
            <input
              type="email"
              {...register("email")}
              className={`w-full p-3 rounded bg-gray-700 text-white outline-none ${
                errors.email ? "border border-red-500" : ""
              }`}
              placeholder="Enter email"
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-white mb-1">Password</label>
            <input
              type="password"
              {...register("password")}
              className={`w-full p-3 rounded bg-gray-700 text-white outline-none ${
                errors.password ? "border border-red-500" : ""
              }`}
              placeholder="Enter password"
            />
            {errors.password && (
              <p className="text-red-500 text-sm">{errors.password.message}</p>
            )}
          </div>

          {/* Native Language */}
          <div>
            <label className="block text-white mb-1">Native Language</label>
            <select
              {...register("nativeLanguage")}
              className={`w-full p-3 rounded bg-gray-700 text-white outline-none ${
                errors.nativeLanguage ? "border border-red-500" : ""
              }`}
            >
              <option value="">Select native language</option>
              <option value="English">English</option>
              <option value="Spanish">Spanish</option>
              <option value="French">French</option>
              <option value="German">German</option>
              <option value="Japanese">Japanese</option>
              <option value="Chinese">Chinese</option>
              <option value="Hindi">Hindi</option>
              <option value="Arabic">Arabic</option>
            </select>
            {errors.nativeLanguage && (
              <p className="text-red-500 text-sm">
                {errors.nativeLanguage.message}
              </p>
            )}
          </div>

          {/* Learning Languages */}
          <div>
            <label className="block text-white mb-1">
              Languages you're learning
            </label>
            <input
              type="text"
              {...register("learningLanguage")}
              className={`w-full p-3 rounded bg-gray-700 text-white outline-none ${
                errors.learningLanguage ? "border border-red-500" : ""
              }`}
              placeholder="e.g. English, Spanish"
            />
            {errors.learningLanguage && (
              <p className="text-red-500 text-sm">
                {errors.learningLanguage.message}
              </p>
            )}
          </div>

          {/* Known Language */}
          <div>
            <label className="block text-white mb-1">Languages you know</label>
            <input
              type="text"
              {...register("knownLanguage")}
              className={`w-full p-3 rounded bg-gray-700 text-white outline-none ${
                errors.knownLanguage ? "border border-red-500" : ""
              }`}
              placeholder="e.g. Hindi"
            />
            {errors.knownLanguage && (
              <p className="text-red-500 text-sm">
                {errors.knownLanguage.message}
              </p>
            )}
          </div>

          {/* Topics of Interest */}
          <div>
            <label className="block text-white mb-1">Topics of interest</label>
            <div className="grid grid-cols-2 gap-2">
              {topicsList.map((topic) => (
                <label key={topic} className="flex items-center gap-2 text-white">
                  <input
                    type="checkbox"
                    value={topic}
                    {...register("topicsOfInterest")}
                  />
                  {topic}
                </label>
              ))}
            </div>
          </div>

          {/* Call Duration Preference */}
          <div>
            <label className="block text-white mb-1">
              Preferred call duration
            </label>
            <select
              {...register("callDurationPreference")}
              className="w-full p-3 rounded bg-gray-700 text-white outline-none"
            >
              {[10, 15, 20, 30, 45, 60].map((d) => (
                <option key={d} value={d}>
                  {d} minutes
                </option>
              ))}
            </select>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-blue-500 hover:bg-blue-600 text-white p-3 rounded font-semibold ${
              loading && "opacity-50 cursor-not-allowed"
            }`}
          >
            {loading ? "Signing up..." : "Sign Up"}
          </button>
        </form>

        <p className="text-center text-white mt-4">
          Already have an account?{" "}
          <span
            onClick={() => navigate("/login")}
            className="text-blue-400 cursor-pointer hover:underline"
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
}

export default Signup;
