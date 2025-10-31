'use client';

import { Alert, Box, Button, TextField, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import React from 'react';

export function HeroWaitlist() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const isValidEmail = /^\S+@\S+\.\S+$/.test(email);

  // When we hit ‘success’, schedule it to clear in 5s:
  useEffect(() => {
    if (status === 'success') {
      const timer = setTimeout(() => {
        setStatus('idle');
      }, 5000);
      return () => clearTimeout(timer);
    } else if (status === 'error') {
      const timer = setTimeout(() => {
        setStatus('idle');
      }, 5000);
      return () => clearTimeout(timer);
    } else if (status === 'sending') {
      const timer = setTimeout(() => {
        setStatus('idle');
      }, 5000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [status]);

  // in components/Waitlist.tsx
  const handleSubmit = async () => {
    if (!isValidEmail) return;
    setStatus('sending');
    setErrorMsg('');

    try {
      const res = await fetch('/api/V1/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      let body: any = null;
      try {
        body = await res.json();
      } catch {
        // ignore JSON parse error; we'll use res.ok below
      }

      if (!res.ok) {
        const serverMsg = body?.message || `HTTP ${res.status}`;
        throw new Error(serverMsg);
      }

      if (body?.status === 'success') {
        setStatus('success');
        setEmail('');
      } else {
        throw new Error(body?.message || 'Server error');
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unknown error occurred');
      setStatus('error');
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        mt: 4,
        gap: 2,
      }}
    >
      {/* Prompt */}
      <Typography
        variant="h2"
        sx={{
          color: 'rgba(255,255,255,0.85)',
          textAlign: 'center',
          fontSize: { xs: '1.5rem', sm: '2rem' },
          fontWeight: 'bold',
        }}
      >
        Join our waitlist!
      </Typography>

      {/* Feedback */}
      {status === 'success' && (
        <Alert severity="success" sx={{ mt: 2, width: { xs: '100%', sm: 'auto' } }}>
          Thanks! You&apos;re on the waitlist. We will notify you when we launch.
        </Alert>
      )}
      {status === 'error' && (
        <Alert severity="error" sx={{ mt: 2, width: { xs: '100%', sm: 'auto' } }}>
          Error: {errorMsg}
        </Alert>
      )}

      {/* Form Row */}
      <Box
        component="form"
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <TextField
          label="Email"
          type="email"
          variant="filled"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={email !== '' && !isValidEmail}
          helperText={email !== '' && !isValidEmail ? 'Please enter a valid email' : ''}
          sx={{
            bgcolor: 'rgba(255,255,255,0.1)',
            borderRadius: 1,
            input: { color: '#fff' },
            '& .MuiFilledInput-underline:before': {
              borderBottomColor: 'rgba(255,255,255,0.4)',
            },
            '& .MuiFilledInput-underline:hover:before': {
              borderBottomColor: '#fff',
            },
            '& .MuiFilledInput-root': { borderRadius: '4px' },
            '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
            '& .MuiInputLabel-root.Mui-focused': { color: '#fff' },
            flex: { xs: '1 1 auto', sm: '0 0 400px' },
          }}
        />

        {/* Only show button when valid */}
        {isValidEmail && (
          <Button
            type="submit"
            variant="contained"
            disabled={status === 'sending'}
            sx={{
              backgroundColor: '#022371',
              color: '#fff',
              '&:hover': { backgroundColor: '#f6066f' },
              px: 4,
              py: 1.5,
              minWidth: '180px',
            }}
          >
            {status === 'sending' ? 'Sending…' : 'Submit'}
          </Button>
        )}
      </Box>
    </Box>
  );
}

type HeroSectionProps = {
  title: string;
  subtitle: string;
  imageUrl: string;
  imageAlt?: string;
};

export const HeroSection: React.FC<HeroSectionProps> = ({
  title,
  subtitle,
  imageUrl,
  imageAlt = 'Hero Image',
}) => {
  return (
    <Box
      sx={{
        px: { xs: '1.5rem', md: '4rem' },
        py: { xs: '3rem', md: '5rem' },
        mx: { xs: '1rem', md: '2rem' },
        borderRadius: '0.75rem',
        backgroundColor: 'rgba(30, 30, 30, 0.7)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
      }}
    >
      {/* Updated Grid v2 usage: no item prop, use size for breakpoints */}
      <Grid container spacing={4} alignItems="center" sx={{ width: '100%' }}>
        {/* Image Column */}
        <Grid size={{ xs: 12, md: 6 }} sx={{ textAlign: 'center', p: { xs: 2, md: 0 } }}>
          <Image
            src={imageUrl}
            alt={imageAlt}
            width={400}
            height={400}
            priority
            style={{ maxWidth: '100%', height: 'auto' }}
          />
        </Grid>

        {/* Text Column */}
        <Grid
          size={{ xs: 12, md: 6 }}
          sx={{
            textAlign: { xs: 'center', md: 'left' },
          }}
        >
          <Typography
            component="h1"
            sx={{
              fontWeight: 'bold',
              color: '#F6066F',
              fontSize: {
                xs: '1.75rem',
                sm: '2.25rem',
                md: '3rem',
                lg: '4rem',
              },
              fontFamily: '"Pinyon Script", cursive, sans-serif',
              textAlign: { xs: 'center', md: 'left' },
            }}
            gutterBottom
          >
            {title}
          </Typography>
          <Typography
            component="p"
            sx={{
              color: '#6a8db0',
              fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' },
              textAlign: { xs: 'center', md: 'left' },
            }}
          >
            {subtitle}
          </Typography>
        </Grid>

        {/* Waitlist Form */}
        <Grid size={12} sx={{ textAlign: 'center' }}>
          <HeroWaitlist />
        </Grid>
      </Grid>
    </Box>
  );
};
