import { useState } from 'react';
import { 
  Box, 
  Paper, 
  TextField, 
  Button, 
  Typography, 
  Alert,
  Link,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

const Signup = () => {
  const [formData, setFormData] = useState({ 
    email: '', 
    password: '', 
    confirmPassword: '',
    role: 'frontend'
  });
  const { handleRegister, loading, error } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation: Check if passwords match
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    // Validation: Check password length
    if (formData.password.length < 6) {
      alert('Password must be at least 6 characters long');
      return;
    }

    // Call register with credentials (without confirmPassword)
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
    <Box className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Paper elevation={3} className="p-8 w-full max-w-md">
        <Typography variant="h4" component="h1" className="mb-6 text-center font-bold">
          Create Account
        </Typography>
        <Typography variant="body2" className="mb-6 text-center text-gray-600">
          Join InterviewAI and start preparing
        </Typography>

        {error && (
          <Alert severity="error" className="mb-4">
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <TextField
            fullWidth
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            autoFocus
            placeholder="your@email.com"
          />
          
          <TextField
            fullWidth
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            placeholder="At least 6 characters"
            helperText="Minimum 6 characters"
          />

          <TextField
            fullWidth
            label="Confirm Password"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            placeholder="Re-enter your password"
          />

          <FormControl fullWidth>
            <InputLabel>Role</InputLabel>
            <Select
              name="role"
              value={formData.role}
              onChange={handleChange}
              label="Role"
            >
              <MenuItem value="frontend">Frontend Developer</MenuItem>
              <MenuItem value="backend">Backend Developer</MenuItem>
              <MenuItem value="data">Data Scientist</MenuItem>
              <MenuItem value="devops">DevOps Engineer</MenuItem>
              <MenuItem value="product">Product Manager</MenuItem>
            </Select>
          </FormControl>

          <Button
            fullWidth
            variant="contained"
            color="primary"
            type="submit"
            disabled={loading}
            size="large"
            className="mt-4"
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </Button>
        </form>

        <Box className="mt-4 text-center">
          <Typography variant="body2">
            Already have an account?{' '}
            <Link component={RouterLink} to="/login" className="font-semibold">
              Login
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default Signup;
