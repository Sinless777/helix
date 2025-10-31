// components/Header.tsx
'use client';

import { SignedIn, SignedOut, UserButton, useUser } from '@clerk/nextjs';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import CloseIcon from '@mui/icons-material/Close';
import DashboardIcon from '@mui/icons-material/Dashboard';
import MenuIcon from '@mui/icons-material/Menu';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import {
  Box,
  Button,
  Drawer,
  IconButton,
  Link as MuiLink,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Stack,
  Typography,
  useMediaQuery,
  Menu,
  MenuItem,
  ListItemIcon,
  Divider,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import * as React from 'react';

import { SignInButton } from '@/components/SignInButton';
import { SignUpButton } from '@/components/SignUpButton';
import { getUserPage } from '@/content/constants/user.pages';

import styles from './Header.module.scss';

export interface Page {
  name: string;
  url: string;
}

export interface HeaderProps {
  logo: string;
  version: string;
  pages: Page[];
  style?: React.CSSProperties;
}

export default function Header({ logo, version, pages, style }: HeaderProps) {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [latestVersion, setLatestVersion] = React.useState<string | null>(null);
  const [accountAnchor, setAccountAnchor] = React.useState<HTMLElement | null>(null);

  const { user, isSignedIn } = useUser();
  const pathname = usePathname();
  const router = useRouter();
  const theme = useTheme();
  const mdUp = useMediaQuery(theme.breakpoints.up('md'));

  const userSlug = React.useMemo(
    () => (user?.username ? user.username : (user?.id ?? '')),
    [user?.username, user?.id]
  );

  const accountMenuOpen = Boolean(accountAnchor);
  const openAccountMenu = (e: React.MouseEvent<HTMLElement>) => setAccountAnchor(e.currentTarget);
  const closeAccountMenu = () => setAccountAnchor(null);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('https://api.github.com/repos/Sinless777/Helix/releases/latest');
        if (!res.ok) throw new Error('bad status');
        const data = await res.json();
        const tag: string = data?.tag_name ?? '';
        if (!cancelled) setLatestVersion(tag.replace(/^v/i, '') || null);
      } catch {
        if (!cancelled) setLatestVersion(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const displayVersion = latestVersion ?? version;
  const releaseUrl = `https://github.com/Sinless777/Helix/releases/tag/v${displayVersion}`;

  // Small helpers for internal navigation (no next/link typing involved)
  const go = (href: string) => router.push(href as unknown as any);
  const goAndClose = (href: string) => {
    setMenuOpen(false);
    router.push(href as unknown as any);
  };

  return (
    <>
      <Box component="header" className={styles.header} style={style}>
        <Box
          sx={{
            width: '100%',
            maxWidth: 1280,
            mx: 'auto',
            px: { xs: 2, sm: 3, md: 4, lg: 5 },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
          }}
        >
          {/* Left: Logo + Version */}
          <Stack direction="row" spacing={2}>
            {/* Logo behaves as button; routes with router.push('/') */}
            <Box
              role="link"
              aria-label="Helix Home"
              onClick={() => go('/')}
              sx={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}
            >
              <Image src={logo} alt="Helix logo" width={120} height={40} priority />
            </Box>

            {/* External link can remain a real anchor */}
            <MuiLink
              href={releaseUrl}
              target="_blank"
              rel="noopener noreferrer"
              underline="none"
              sx={{
                color: 'rgba(255,255,255,0.85)',
                fontSize: '0.85rem',
                '&:hover': {
                  color: '#fff',
                  fontWeight: 700,
                  textShadow: '0 0 6px rgba(2,35,113,0.6)',
                },
                alignSelf: 'center',
              }}
            >
              V{displayVersion}
            </MuiLink>
          </Stack>

          {/* Middle: Nav */}
          {mdUp && (
            <Stack
              component="nav"
              direction="row"
              sx={{
                flexGrow: 1,
                justifyContent: 'center',
                alignItems: 'center',
                flexWrap: 'wrap',
                columnGap: { md: 2.25, lg: 3 },
                rowGap: 0.75,
                minWidth: 0,
                px: 1,
              }}
            >
              {pages.map((p) => {
                const active = pathname === p.url;
                return (
                  <Button
                    key={p.name}
                    onClick={() => go(p.url)}
                    sx={{
                      color: 'inherit',
                      fontWeight: active ? 700 : 500,
                      textDecorationThickness: active ? '2px' : undefined,
                      whiteSpace: 'nowrap',
                      textTransform: 'none',
                      px: 1,
                      minWidth: 0,
                    }}
                  >
                    {p.name}
                  </Button>
                );
              })}
            </Stack>
          )}

          {/* Right: Auth / Account */}
          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
            sx={{ flexShrink: 0, pl: { md: 1 }, pr: { md: 0.5 } }}
          >
            {mdUp ? (
              <>
                <SignedOut>
                  <Stack direction="row" spacing={1.25}>
                    <SignInButton />
                    <SignUpButton />
                  </Stack>
                </SignedOut>

                <SignedIn>
                  <UserButton afterSignOutUrl="/" />

                  {isSignedIn && userSlug && (
                    <>
                      <Button
                        id="account-menu-button"
                        aria-controls={accountMenuOpen ? 'account-menu' : undefined}
                        aria-haspopup="true"
                        aria-expanded={accountMenuOpen ? 'true' : undefined}
                        onClick={openAccountMenu}
                        endIcon={<ArrowDropDownIcon />}
                        sx={{ ml: 0.5 }}
                      >
                        Account
                      </Button>

                      <Menu
                        id="account-menu"
                        anchorEl={accountAnchor}
                        open={accountMenuOpen}
                        onClose={closeAccountMenu}
                        onClick={closeAccountMenu}
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                      >
                        {/* Programmatic navigation (no typed next/link inside MUI) */}
                        <MenuItem onClick={() => go(getUserPage('profile', userSlug))}>
                          <ListItemIcon>
                            <PersonIcon fontSize="small" />
                          </ListItemIcon>
                          Profile
                        </MenuItem>
                      </Menu>
                    </>
                  )}
                </SignedIn>
              </>
            ) : (
              <IconButton
                onClick={() => setMenuOpen(true)}
                sx={{ color: '#fff' }}
                aria-label="Open menu"
              >
                <MenuIcon fontSize="large" />
              </IconButton>
            )}
          </Stack>
        </Box>
      </Box>

      {/* Drawer for small screens */}
      <Drawer
        anchor="right"
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        PaperProps={{ sx: { width: 300, bgcolor: '#1f1f2a', color: '#fff' } }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ px: 2, py: 2 }}
        >
          <Typography variant="subtitle1">Menu</Typography>
          <IconButton
            onClick={() => setMenuOpen(false)}
            sx={{ color: '#fff' }}
            aria-label="Close menu"
          >
            <CloseIcon />
          </IconButton>
        </Stack>

        <List component="nav">
          {pages.map((p) => {
            const active = pathname === p.url;
            return (
              <ListItem key={p.name} disablePadding>
                <ListItemButton
                  onClick={() => goAndClose(p.url)}
                  selected={active}
                  sx={{ color: 'inherit', '&.Mui-selected': { bgcolor: 'rgba(255,255,255,.08)' } }}
                >
                  <ListItemText primary={p.name} />
                </ListItemButton>
              </ListItem>
            );
          })}

          {/* Mobile: account group when signed in */}
          <SignedIn>
            {isSignedIn && userSlug && (
              <>
                <Divider sx={{ my: 1.5, opacity: 0.2 }} />
                <ListItem disablePadding>
                  <ListItemButton onClick={() => goAndClose(getUserPage('profile', userSlug))}>
                    <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>
                      <PersonIcon />
                    </ListItemIcon>
                    <ListItemText primary="Profile" />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton onClick={() => goAndClose(getUserPage('dashboard', userSlug))}>
                    <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>
                      <DashboardIcon />
                    </ListItemIcon>
                    <ListItemText primary="Dashboard" />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton onClick={() => goAndClose(getUserPage('settings', userSlug))}>
                    <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>
                      <SettingsIcon />
                    </ListItemIcon>
                    <ListItemText primary="Settings" />
                  </ListItemButton>
                </ListItem>
              </>
            )}
          </SignedIn>
        </List>

        <Box sx={{ px: 2, pb: 2 }}>
          <SignedOut>
            <Stack direction="row" spacing={1}>
              <SignInButton />
              <SignUpButton />
            </Stack>
          </SignedOut>
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </Box>
      </Drawer>

      {/* Spacer so content isn’t hidden behind the fixed header */}
      <Box sx={{ height: { xs: 64, md: 68 } }} />
    </>
  );
}
