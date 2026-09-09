import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { Box, Paper, TextField, Button, Typography, Alert } from '@mui/material';
import { useAuth } from '../../context/AuthContext';

const loginSchema = z.object({
  username: z.string().min(1, 'Username wajib diisi'),
  password: z.string().min(1, 'Password wajib diisi'),
});

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    setServerError('');
    try {
      await login(data.username, data.password);
      navigate('/');
    } catch (err) {
      setServerError(err?.message || 'Username atau password salah');
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default' }}>
      <Paper elevation={0} sx={{ p: 4, width: 360, border: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h5" fontWeight={600} gutterBottom>Clinic Information System</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Masuk untuk melanjutkan</Typography>

        {serverError && <Alert severity="error" sx={{ mb: 2 }}>{serverError}</Alert>}

        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <TextField fullWidth label="Username" margin="normal" {...register('username')} error={!!errors.username} helperText={errors.username?.message} />
          <TextField fullWidth label="Password" type="password" margin="normal" {...register('password')} error={!!errors.password} helperText={errors.password?.message} />
          <Button type="submit" fullWidth variant="contained" size="large" sx={{ mt: 3 }} disabled={isSubmitting}>
            {isSubmitting ? 'Memproses...' : 'Login'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}