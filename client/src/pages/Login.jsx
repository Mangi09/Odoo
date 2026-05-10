import React from 'react'

const Login = () => {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 flex items-center justify-center px-6">
      
      {/* Login Card */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 md:p-10">
        
        {/* Profile Logo */}
        <div className="flex justify-center mb-6">
          <div className="w-28 h-28 rounded-full bg-primary flex items-center justify-center shadow-lg border-4 border-gray-200">
            <span className="text-white text-3xl font-bold">
              L
            </span>
          </div>
        </div>

        {/* Heading */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Welcome Back
          </h1>

          <p className="text-gray-500 mt-2">
            Login to continue
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
            className="w-full px-4 py-4 border border-gray-300 rounded-xl outline-none bg-gray-50 focus:bg-white focus:ring-2 focus:ring-black transition duration-200"
          />
        </div>

        {/* Password */}
        <div className="mb-3">
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Password
          </label>

          <input
            type="password"
            placeholder="Enter your password"
            className="w-full px-4 py-4 border border-gray-300 rounded-xl outline-none bg-gray-50 focus:bg-white focus:ring-2 focus:ring-black transition duration-200"
          />
        </div>

        {/* Forgot Password */}
        <div className="flex justify-end mb-6">
          <button className="text-sm text-gray-600 hover:text-black transition">
            Forgot Password?
          </button>
        </div>

        {/* Login Button */}
        <button className="w-full bg-primary text-white py-4 rounded-xl font-semibold text-lg hover:bg-gray-800 transition duration-300 shadow-md">
          Login
        </button>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-1 h-[1px] bg-gray-300"></div>

          <span className="px-4 text-gray-500 text-sm">
            OR
          </span>

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
    </main>
  )
}

export default Login