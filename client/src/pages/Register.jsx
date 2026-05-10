import React from 'react'

const Register = () => {
  return (
    <main className="w-full min-h-screen grid grid-cols-1 lg:grid-cols-2">

      {/* Left Side Form */}
      <div className="flex items-center justify-center bg-white p-8 md:p-14">
        
        <div className="w-full max-w-2xl">

          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-4xl font-bold text-gray-800">
              Register
            </h2>

            <p className="text-gray-500 mt-2">
              Fill in your details to create an account
            </p>
          </div>

          {/* Profile Circle */}
          <div className="flex justify-center mb-8">
            <div className="w-28 h-28 rounded-full bg-primary border-4 border-gray-200 shadow-lg"></div>
          </div>

          {/* Name Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            <input
              type="text"
              placeholder="First Name"
              className="w-full p-4 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-primary"
            />

            <input
              type="text"
              placeholder="Last Name"
              className="w-full p-4 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Email & Phone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            <input
              type="email"
              placeholder="Email Address"
              className="w-full p-4 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-primary"
            />

            <input
              type="tel"
              placeholder="Phone Number"
              className="w-full p-4 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* City & Country */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            <input
              type="text"
              placeholder="City"
              className="w-full p-4 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-primary"
            />

            <input
              type="text"
              placeholder="Country"
              className="w-full p-4 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Additional Info */}
          <div className="mb-6">
            <textarea
              placeholder="Additional Information..."
              rows="4"
              className="w-full p-4 border border-gray-300 rounded-xl outline-none resize-none focus:ring-2 focus:ring-primary"
            ></textarea>
          </div>

          {/* Button */}
          <button className="w-full bg-primary text-white py-4 rounded-xl text-lg font-semibold hover:opacity-90 transition duration-300">
            Create Account
          </button>

        </div>
      </div>

      {/* Right Side Image */}
      <div className="hidden lg:block h-screen">
        <img
          src="https://images.unsplash.com/photo-1488646953014-85cb44e25828"
          alt="Travel"
          className="w-full h-full object-cover"
        />
      </div>

    </main>
  )
}

export default Register