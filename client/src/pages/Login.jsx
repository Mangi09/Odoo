import React from 'react'

const Login = () => {
  return (
    <main className="min-h-screen w-full flex flex-col md:flex-row">

      {/* LEFT SIDE - Illustration */}
      <section className="w-full md:w-1/2 h-screen relative overflow-hidden">
        <img
          src="/image.jpeg"
          alt="Login Illustration"
          className="absolute inset-0 w-full h-full object-cover"
        />

      </section>

      {/* RIGHT SIDE - Form */}
      <section className="w-full md:w-1/2 flex items-center justify-center bg-white px-6 md:px-16 py-12">

        <div className="w-full max-w-md">

          {/* Heading */}
          <div className="mb-10 text-center md:text-left">
            <h1 className="text-4xl font-bold text-gray-800">
              Welcome Back
            </h1>

            <p className="text-gray-500 mt-2">
              Login to continue your journey
            </p>
          </div>

          {/* Username */}
          <div className="mb-5">
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Username
            </label>

            <input
              type="text"
              placeholder="Enter your username"
              className="w-full px-4 py-4 border border-gray-300 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-black outline-none transition"
            />
          </div>

          {/* Password */}
          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Password
            </label>

            <input
              type="password"
              placeholder="Enter your password"
              className="w-full px-4 py-4 border border-gray-300 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-black outline-none transition"
            />
          </div>

          {/* Forgot Password */}
          <div className="flex justify-end mb-6">
            <button className="text-sm text-gray-600 hover:text-black">
              Forgot Password?
            </button>
          </div>

          {/* Login Button */}
          <button className="w-full bg-primary text-white py-4 rounded-xl font-semibold text-lg hover:bg-gray-800 transition shadow-md">
            Login
          </button>

          {/* Divider */}
          <div className="flex items-center my-8">
            <div className="flex-1 h-[1px] bg-gray-300"></div>
            <span className="px-4 text-gray-500 text-sm">OR</span>
            <div className="flex-1 h-[1px] bg-gray-300"></div>
          </div>

          {/* Register Link */}
          <p className="text-center text-gray-600">
            Don&apos;t have an account?{" "}
            <span className="font-semibold text-primary cursor-pointer hover:underline">
              Register
            </span>
          </p>

        </div>
      </section>

    </main>
  )
}

export default Login