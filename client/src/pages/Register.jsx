import React, { useState } from 'react'

const Register = () => {
  const [avatar, setAvatar] = useState(null)

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setAvatar(URL.createObjectURL(file))
    }
  }

  return (
    <main className="w-full min-h-screen grid grid-cols-1 lg:grid-cols-2">

      {/* LEFT - FORM */}
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

          {/* Avatar Upload */}
          <div className="flex flex-col items-center mb-8">

            <div className="w-28 h-28 rounded-full border-4 border-gray-200 shadow-lg overflow-hidden bg-gray-100 flex items-center justify-center">
              {avatar ? (
                <img
                  src={avatar}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-gray-400 text-sm">
                  No Image
                </span>
              )}
            </div>

            <label className="mt-4 cursor-pointer text-sm text-primary font-medium hover:underline">
              Upload Profile Picture
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </label>
          </div>

          {/* Name Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">

            <div>
             <input
                type="text"
                placeholder="First Name"
                className="w-full p-4 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <input
                type="text"
                placeholder="Last Name"
                className="w-full p-4 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Email & Phone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">

            <div>
              <input
                type="email"
                placeholder="Email"
                className="w-full p-4 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
             <input
                type="tel"
                placeholder="Phone Number"
                className="w-full p-4 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* City & Country */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">

            <div>
              <input
                type="text"
                placeholder="City"
                className="w-full p-4 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <input
                type="text"
                placeholder="Country"
                className="w-full p-4 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Additional Info */}
          <div className="mb-6">
           <textarea
              placeholder="Tell us something about you..."
              rows="4"
              className="w-full p-4 border border-gray-300 rounded-xl outline-none resize-none focus:ring-2 focus:ring-primary"
            ></textarea>
          </div>

          {/* Button */}
          <button className="w-full bg-primary text-white py-4 rounded-xl text-lg font-semibold hover:opacity-90 transition">
            Create Account
          </button>

        </div>
      </div>

      {/* RIGHT - IMAGE */}
      <div className="hidden lg:block fixed right-0 top-0 w-1/2 h-screen">
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