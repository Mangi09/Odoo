import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiRequest, setStoredUser } from '../lib/api'
import { getPlaceImage } from '../lib/images'

const Register = () => {
  const navigate = useNavigate()
  const [avatar, setAvatar] = useState(null)
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    phoneNumber: '',
    city: '',
    country: '',
    additionalInfo: '',
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setAvatar(URL.createObjectURL(file))
    }
  }

  const updateForm = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const data = await apiRequest('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          fullName: [form.firstName, form.lastName].filter(Boolean).join(' '),
        }),
      })
      setStoredUser(data.user)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="w-full min-h-screen grid grid-cols-1 lg:grid-cols-2">

      {/* LEFT - FORM */}
      <div className="flex justify-center bg-white p-8 md:p-14 overflow-y-auto">

        <form className="w-full max-w-2xl" onSubmit={handleSubmit}>

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
                value={form.firstName}
                onChange={(event) => updateForm('firstName', event.target.value)}
                placeholder="First Name"
                className="w-full p-4 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div>
              <input
                type="text"
                value={form.lastName}
                onChange={(event) => updateForm('lastName', event.target.value)}
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
                value={form.email}
                onChange={(event) => updateForm('email', event.target.value)}
                placeholder="Email"
                className="w-full p-4 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div>
             <input
                type="tel"
                value={form.phoneNumber}
                onChange={(event) => updateForm('phoneNumber', event.target.value)}
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
                value={form.city}
                onChange={(event) => updateForm('city', event.target.value)}
                placeholder="City"
                className="w-full p-4 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <input
                type="text"
                value={form.country}
                onChange={(event) => updateForm('country', event.target.value)}
                placeholder="Country"
                className="w-full p-4 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Additional Info */}
          <div className="mb-6">
           <textarea
              value={form.additionalInfo}
              onChange={(event) => updateForm('additionalInfo', event.target.value)}
              placeholder="Tell us something about you..."
              rows="4"
              className="w-full p-4 border border-gray-300 rounded-xl outline-none resize-none focus:ring-2 focus:ring-primary"
            ></textarea>
          </div>

          {/* Button */}
          <div className="mb-5">
            <input
              type="text"
              value={form.username}
              onChange={(event) => updateForm('username', event.target.value)}
              placeholder="Username"
              className="w-full p-4 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="mb-6">
            <input
              type="password"
              value={form.password}
              onChange={(event) => updateForm('password', event.target.value)}
              placeholder="Password"
              className="w-full p-4 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          {error && (
            <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary text-white py-4 rounded-xl text-lg font-semibold hover:opacity-90 transition disabled:opacity-70"
          >
            {isLoading ? 'Creating account...' : 'Create Account'}
          </button>

          <p className="mt-6 text-center text-gray-600">
            Already registered?{' '}
            <Link to="/login" className="font-semibold text-primary hover:underline">
              Login
            </Link>
          </p>

        </form>
      </div>

      {/* RIGHT - IMAGE */}
      <div className="hidden h-full lg:block overflow-hidden">
        <img
          src={getPlaceImage({ country: 'Japan' })}
          alt="Travel"
          className="w-full h-full object-cover"
        />
      </div>

    </main>
  )
}

export default Register
