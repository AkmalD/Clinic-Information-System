import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { Box, TextField, Button, Typography, Alert, Avatar, Link } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import { useAuth } from '../../context/AuthContext';
import hospitalImg from '../../assets/login/hospital.png';

const loginSchema = z.object({
  username: z.string().min(1, 'Username wajib diisi'),
  password: z.string().min(1, 'Password wajib diisi'),
});

const glassFieldSx = {
  '& .MuiInput-input': {
    color: '#0F3D33',
    fontSize: '1.05rem',
    py: 1,
  },
  '& .MuiInput-input::placeholder': {
    color: 'rgba(15, 61, 51, 0.55)',
    opacity: 1,
  },
  '& .MuiInput-underline:before': {
    borderBottomColor: 'rgba(11, 110, 79, 0.35)',
  },
  '& .MuiInput-underline:hover:not(.Mui-disabled):before': {
    borderBottomColor: 'rgba(11, 110, 79, 0.6)',
  },
  '& .MuiInput-underline:after': {
    borderBottomColor: '#0B6E4F',
  },
};

function Branding({ compact = false }) {
  return (
    <Box sx={{ textAlign: compact ? 'center' : 'left' }}>
      <Typography
        component="h1"
        sx={{
          fontFamily: '"Georgia", "Times New Roman", serif',
          fontWeight: 700,
          letterSpacing: '0.06em',
          color: '#123A31',
          fontSize: compact ? '1.75rem' : '2.6rem',
          lineHeight: 1.1,
        }}
      >
        PRATAMA
      </Typography>
      <Typography
        sx={{
          fontFamily: '"Georgia", "Times New Roman", serif',
          color: '#2E5248',
          fontSize: compact ? '1rem' : '1.4rem',
          mt: 0.5,
        }}
      >
        Clinic Information System
      </Typography>
    </Box>
  );
}

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
    <Box
      sx={{
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: { xs: 'center', md: 'space-between' },
        gap: { md: 4 },
        px: { xs: 3, md: 8 },
        py: 4,
        background:
          'linear-gradient(135deg, #F2FAF6 0%, #EAF5F0 45%, #F6F3EF 100%)',
      }}
    >
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          top: '-8%',
          right: '8%',
          width: 380,
          height: 380,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(76,154,125,0.35), transparent 70%)',
          filter: 'blur(20px)',
          zIndex: 0,
        }}
      />
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          bottom: '-10%',
          right: '22%',
          width: 320,
          height: 320,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(232,130,91,0.22), transparent 70%)',
          filter: 'blur(24px)',
          zIndex: 0,
        }}
      />

      <Box
        sx={{
          flex: 1,
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          maxWidth: 900,
          zIndex: 1,
        }}
      >
        <Branding />
        <Box
          component="img"
          src={hospitalImg}
          alt="Ilustrasi gedung klinik Pratama"
          sx={{
            width: '100%',
            maxWidth: { md: 620, lg: 780, xl: 860 },
            height: 'auto',
            mt: 1,
            alignSelf: 'center',
            filter: 'drop-shadow(0 18px 30px rgba(18, 58, 49, 0.12))',
          }}
        />
      </Box>

      <Box
        sx={{
          zIndex: 1,
          width: '100%',
          maxWidth: 400,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* Compact branding above the card on mobile */}
        <Box sx={{ display: { xs: 'block', md: 'none' }, mb: 3 }}>
          <Branding compact />
        </Box>

        <Box
          sx={{
            position: 'relative',
            width: '100%',
            mt: 5,
            px: { xs: 3, sm: 4.5 },
            pt: 7,
            pb: 4.5,
            borderRadius: '28px',
            background:
              'linear-gradient(140deg, rgba(255,255,255,0.55) 0%, rgba(224,241,234,0.35) 55%, rgba(246,243,239,0.4) 100%)',
            backdropFilter: 'blur(18px)',
            WebkitBackdropFilter: 'blur(18px)',
            border: '1px solid rgba(255,255,255,0.6)',
            boxShadow: '0 12px 40px rgba(11, 110, 79, 0.18)',
          }}
        >
          {/* Avatar overhanging the top edge */}
          <Avatar
            sx={{
              position: 'absolute',
              top: 0,
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 76,
              height: 76,
              bgcolor: '#0B6E4F',
              boxShadow: '0 6px 18px rgba(11, 110, 79, 0.35)',
              border: '3px solid rgba(255,255,255,0.7)',
            }}
          >
            <PersonIcon sx={{ fontSize: 42 }} />
          </Avatar>

          <Typography
            component="h2"
            sx={{
              textAlign: 'center',
              fontWeight: 600,
              letterSpacing: '0.18em',
              color: '#0F3D33',
              fontSize: '1.9rem',
              mb: 3,
            }}
          >
            LOGIN
          </Typography>

          {serverError && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 3 }}>
              {serverError}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <TextField
              fullWidth
              variant="standard"
              placeholder="Username"
              margin="normal"
              sx={glassFieldSx}
              slotProps={{ htmlInput: { 'aria-label': 'Username' } }}
              {...register('username')}
              error={!!errors.username}
              helperText={errors.username?.message}
            />
            <TextField
              fullWidth
              variant="standard"
              type="password"
              placeholder="Password"
              margin="normal"
              sx={glassFieldSx}
              slotProps={{ htmlInput: { 'aria-label': 'Password' } }}
              {...register('password')}
              error={!!errors.password}
              helperText={errors.password?.message}
            />

            <Button
              type="submit"
              fullWidth
              disabled={isSubmitting}
              sx={{
                mt: 4,
                py: 1.4,
                borderRadius: '999px',
                fontSize: '1.05rem',
                fontWeight: 600,
                letterSpacing: '0.12em',
                color: '#fff',
                background: 'linear-gradient(90deg, #0B6E4F 0%, #4C9A7D 100%)',
                boxShadow: '0 8px 20px rgba(11, 110, 79, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(90deg, #095B41 0%, #3F856B 100%)',
                },
                '&.Mui-disabled': { color: 'rgba(255,255,255,0.7)' },
              }}
            >
              {isSubmitting ? 'MEMPROSES...' : 'SIGN IN'}
            </Button>
          </Box>

          <Typography sx={{ textAlign: 'center', mt: 2.5, fontSize: '0.9rem', color: '#2E5248' }}>
            Forgot password?{' '}
            <Link
              component="button"
              type="button"
              underline="hover"
              sx={{ fontWeight: 700, color: '#0B6E4F' }}
              onClick={() => {
                // TODO: arahkan ke halaman reset password bila sudah tersedia
              }}
            >
              Click here
            </Link>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}