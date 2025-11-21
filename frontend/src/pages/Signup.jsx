import { useState } from 'react';
import { Link } from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="bg-white/80 backdrop-blur-md shadow-sm fixed w-full z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="shrink-0 flex items-center">
            <RouterLink to="/" className="text-2xl font-bold text-blue-500">
              InterviewAI
            </RouterLink>
          </div>
          <div className="flex items-center">
            <RouterLink to="/login" className="font-semibold text-blue-400 hover:text-blue-300">
              Login
            </RouterLink>
          </div>
        </div>
      </div>
    </nav>
  );
};

const Signup = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    role: 'frontend'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({
    password: '',
    confirmPassword: '',
  });
  const { handleRegister, loading, error } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newFormData = { ...formData, [name]: value };
    setFormData(newFormData);
    validateField(name, value, newFormData);
  };

  const validateField = (name, value, currentFormData) => {
    if (name === 'password' || name === 'confirmPassword') {
      let passwordError = '';
      let confirmPasswordError = '';

      if (currentFormData.password && currentFormData.password.length < 6) {
        passwordError = 'Password must be at least 6 characters long.';
      }

      if (currentFormData.confirmPassword && currentFormData.password !== currentFormData.confirmPassword) {
        confirmPasswordError = 'Passwords do not match.';
      }

      setFormErrors({ password: passwordError, confirmPassword: confirmPasswordError });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formErrors.password || formErrors.confirmPassword || formData.password.length < 6) {
      validateField('password', formData.password, formData);
      validateField('confirmPassword', formData.confirmPassword, formData);
      return;
    }
    const result = await handleRegister({
      email: formData.email,
      password: formData.password,
      role: formData.role
    });

    if (result.success) {
      navigate('/dashboard');
    }
  };

  return (
    <>
      <Navbar />
      <div class="flex h-screen flex-col justify-center px-6 py-12 lg:px-8">
        <div class="sm:mx-auto sm:w-full sm:max-w-sm">
          <h2 class="mt-10 text-center text-2xl/9 text-stone-800 font-bold tracking-tight">
            Your first step to acing interviews is just a sign-up away!
          </h2>
        </div>

        <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <form onSubmit={handleSubmit} class="space-y-6">
            <div>
              <label for="email" class="block text-sm/6 font-medium text-gray-800">Email address</label>
              <div class="mt-2">
                <input label="Email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  autoFocus
                  placeholder="your@email.com"
                  autocomplete="email"
                  class="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-stone-500 outline-1 -outline-offset-1 outline-grey/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-500 sm:text-sm/6" />
              </div>
            </div>

            <div>
              <div class="flex items-center justify-between">
                <label for="password" class="block text-sm/6 font-medium text-gray-800">Password</label>
              </div>
              <div class="mt-2 relative">
                <input label="Password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="At least 6 characters" autocomplete="current-password" class="block w-full rounded-md bg-white/5 px-3 pr-10 py-1.5 text-base text-stone-500 outline-1 -outline-offset-1 outline-stone/10 placeholder:text-stone-500 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-500 sm:text-sm/6" />
                <div class="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button type="button" onClick={() => setShowPassword(!showPassword)} class="text-gray-500">
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L6.228 6.228" /></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    )}
                  </button>
                </div>
                {formErrors.password && <span class="text-sm text-red-500">{formErrors.password}</span>}
              </div>

            </div>
            <div>
              <div class="flex items-center justify-between">
                <label for="confirm-password" class="block text-sm/6 font-medium text-gray-800">Confirm Password</label>

              </div>
              <div class="mt-2 relative">
                <input
                  label="Confirm Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  placeholder="Re-enter your password" autocomplete="current-password" class="block w-full rounded-md bg-white/5 px-3 pr-10 py-1.5 text-base text-stone-500 outline-1 -outline-offset-1 outline-stone/10 placeholder:text-stone-500 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-500 sm:text-sm/6" />
                <div class="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} class="text-gray-500">
                    {showConfirmPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L6.228 6.228" /></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    )}
                  </button>
                </div>
                {formErrors.confirmPassword && <span class="text-sm text-red-500">{formErrors.confirmPassword}</span>}
              </div>
            </div>
            <div>
              <label for="role" class="block text-sm/6 font-medium text-gray-800">Role</label>
              <div class="mt-2 relative">
                <select
                  label="Role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                  class="appearance-none block w-full rounded-lg border border-stone-300 bg-white/5 px-3 pr-10 py-1.5 text-base text-stone-500 placeholder:text-stone-500 focus:outline-2 focus:outline-offset-2 focus:outline-indigo-500 sm:text-sm/6">
                  <option value="frontend" class="bg-white text-stone-800">Frontend Developer</option>
                  <option value="backend" class="bg-white text-stone-800">Backend Developer</option>
                  <option value="data" class="bg-white text-stone-800">Data Scientist</option>
                  <option value="devops" class="bg-white text-stone-800">DevOps Engineer</option>
                  <option value="product" class="bg-white text-stone-800">Product Manager</option>
                </select>
                <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-stone-500">
                  <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fill-rule="evenodd" d="M10 3a.75.75 0 01.55.24l3.25 3.5a.75.75 0 11-1.1 1.02L10 4.852 7.3 7.76a.75.75 0 01-1.1-1.02l3.25-3.5A.75.75 0 0110 3zm-3.76 9.2a.75.75 0 011.06.04l2.7 2.908 2.7-2.908a.75.75 0 111.1 1.02l-3.25 3.5a.75.75 0 01-1.1 0l-3.25-3.5a.75.75 0 01.04-1.06z" clip-rule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                class="flex w-full justify-center rounded-md bg-blue-500 px-3 py-1.5 text-sm/6 font-semibold text-white hover:bg-blue-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500">
                {loading ? 'Creating Account...' : 'Sign Up'}
              </button>
            </div>
          </form>

          <p class="mt-10 text-center text-sm/6 text-gray-400">
            Already have an account?{' '}
            <Link
              component={RouterLink} to="/login"
              class="font-semibold text-blue-400 hover:text-blue-300">
              Login
            </Link>
          </p>
        </div>
      </div>


    </>
  );
};

export default Signup;
