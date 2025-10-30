'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import {
  Alert,
  Box,
  Button,
  Divider,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useMutation } from 'convex/react';
import { encryptJson } from '@/lib/security/encrypt.util';
import PrimitiveModal from '@/components/users/ui/modal';
import { Gender, GenderValues } from '@/content/constants/profile/gender.enum';
import { Sex, SexValues } from '@/content/constants/profile/sex.enum';
import { Sexuality, SexualityValues } from '@/content/constants/profile/sexuality.enum';
import { GradeLevel, GradeLevelValues } from '@/content/constants/profile/grade-level.enum';
import { Country } from '@/content/constants/profile/country.enum';
import GlassCard from '@/components/ui/GlassCard';

const BIO_MAX_LENGTH = 10_000;
type MailingAddress = {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

type ProfileBasics = {
  userId: string;
  firstName?: string | null;
  middleName?: string | null;
  lastName?: string | null;
  gender?: string | null;
  sex?: string | null;
  sexuality?: string | null;
  genderCustom?: string | null;
  sexCustom?: string | null;
  sexualityCustom?: string | null;
  bio?: string | null;
  profession?: string | null;
  gradeLevel?: string | null;
  country?: string | null;
  mailingAddress?: Partial<MailingAddress> | null;
  features?: string[] | null;
  isPaid?: boolean | null;
  subscriptionPlan?: string | null;
  settingsId?: string | null;
  version?: number | null;
};

type UserBasics = {
  id: string;
  name: string;
  username?: string | null;
  avatarUrl?: string | null;
  createdAt?: string | null;
  bio?: string | null;
  about?: string | null;
};

type FormState = {
  firstName: string;
  middleName: string;
  lastName: string;
  gender: string;
  genderCustom: string;
  sex: string;
  sexCustom: string;
  sexuality: string;
  sexualityCustom: string;
  bio: string;
  profession: string;
  gradeLevel: string;
  country: string;
  mailingAddress: MailingAddress;
};

type ProfileDetailsProps = {
  user: UserBasics;
  profile: ProfileBasics;
  canEdit: boolean;
  isAuthenticated: boolean;
};

function isOption<T extends string>(
  value: string | null | undefined,
  options: readonly T[],
  fallback: T,
): T {
  return value && options.includes(value as T) ? (value as T) : fallback;
}

function createFormState(profile: ProfileBasics): FormState {
  const countryOptions = Object.values(Country) as string[];
  const safeCountry =
    profile.country && countryOptions.includes(profile.country)
      ? profile.country
      : Country.Other;

  const gradeFallback =
    GradeLevelValues.find((value) => value === GradeLevel.PreferNotToSay) ??
    GradeLevelValues[0] ??
    '';

  return {
    firstName: profile.firstName ?? '',
    middleName: profile.middleName ?? '',
    lastName: profile.lastName ?? '',
    gender: isOption(profile.gender, GenderValues, Gender.PreferNotToSay),
    genderCustom: profile.genderCustom ?? '',
    sex: isOption(profile.sex, SexValues, Sex.PreferNotToSay),
    sexCustom: profile.sexCustom ?? '',
    sexuality: isOption(profile.sexuality, SexualityValues, Sexuality.PreferNotToSay),
    sexualityCustom: profile.sexualityCustom ?? '',
    bio: profile.bio ?? '',
    profession: profile.profession ?? '',
    gradeLevel: isOption(profile.gradeLevel, GradeLevelValues, gradeFallback),
    country: safeCountry,
    mailingAddress: {
      street: profile.mailingAddress?.street ?? '',
      city: profile.mailingAddress?.city ?? '',
      state: profile.mailingAddress?.state ?? '',
      postalCode: profile.mailingAddress?.postalCode ?? '',
      country: profile.mailingAddress?.country ?? '',
    },
  };
}

function cloneFormState(state: FormState): FormState {
  return {
    ...state,
    mailingAddress: { ...state.mailingAddress },
  };
}

function trimFormState(state: FormState): FormState {
  return {
    ...state,
    firstName: state.firstName.trim(),
    middleName: state.middleName.trim(),
    lastName: state.lastName.trim(),
    genderCustom: state.genderCustom.trim(),
    sexCustom: state.sexCustom.trim(),
    sexualityCustom: state.sexualityCustom.trim(),
    bio: state.bio.slice(0, BIO_MAX_LENGTH),
    profession: state.profession.trim(),
    gradeLevel: state.gradeLevel,
    gender: state.gender,
    sex: state.sex,
    sexuality: state.sexuality,
    country: state.country,
    mailingAddress: {
      street: state.mailingAddress.street.trim(),
      city: state.mailingAddress.city.trim(),
      state: state.mailingAddress.state.trim(),
      postalCode: state.mailingAddress.postalCode.trim(),
      country: state.mailingAddress.country.trim(),
    },
  };
}

function hasMailingAddress(address: MailingAddress) {
  return Object.values(address).some((value) => value.trim() !== '');
}

function startCase(input: string) {
  return input
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatGradeLabel(value: string) {
  if (!value) return 'Not specified';
  if (/^\d+$/.test(value)) {
    return `Grade ${value}`;
  }
  return startCase(value);
}

function formatIdentityLabel(value: string | undefined) {
  if (!value) return 'Not specified';
  return startCase(value);
}

function formatMailingAddress(address: MailingAddress) {
  const parts = [
    address.street,
    address.city,
    address.state,
    address.postalCode,
    address.country,
  ]
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length === 0) {
    return 'No mailing address on file.';
  }

  return parts.join(', ');
}

export function ProfileDetails({
  user,
  profile,
  canEdit,
  isAuthenticated,
}: ProfileDetailsProps) {
  const [profileData, setProfileData] = useState<FormState>(() => createFormState(profile));
  const [draft, setDraft] = useState<FormState>(() => createFormState(profile));
  const [open, setOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const saveEncryptedProfile = useMutation<any>('profile:save');
  const profileKey = process.env.NEXT_PUBLIC_PROFILE_ENCRYPTION_KEY;

  const canViewSensitive = isAuthenticated;

  useEffect(() => {
    const next = createFormState(profile);
    setProfileData(next);
    if (!open) {
      setDraft(next);
    }
  }, [profile, open]);

  const countryOptions = useMemo(() => Object.values(Country) as string[], []);

  const displayName = useMemo(() => {
    const segments = [
      profileData.firstName,
      profileData.middleName,
      profileData.lastName,
    ]
      .map((segment) => segment.trim())
      .filter(Boolean);

    return segments.join(' ') || user.name;
  }, [profileData.firstName, profileData.middleName, profileData.lastName, user.name]);

  const joinedDisplay = useMemo(() => {
    if (!user.createdAt) return null;
    const date = new Date(user.createdAt);
    if (Number.isNaN(date.getTime())) return null;
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }, [user.createdAt]);

  const displayedBio = canViewSensitive
    ? profileData.bio || user.bio || user.about || ''
    : '';

  const handleOpen = useCallback(() => {
    if (!canEdit) return;
    setSubmitError(null);
    setDraft(cloneFormState(profileData));
    setOpen(true);
  }, [canEdit, profileData]);

  const handleClose = useCallback(() => {
    if (isSaving) return;
    setOpen(false);
  }, [isSaving]);

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (isSaving || !canEdit) return;

      setIsSaving(true);
      setSubmitError(null);

      const trimmed = trimFormState(draft);

      if (trimmed.bio.length > BIO_MAX_LENGTH) {
        setSubmitError(`Bio must be ${BIO_MAX_LENGTH.toLocaleString()} characters or fewer.`);
        setIsSaving(false);
        return;
      }

      try {
        if (!profileKey) {
          throw new Error('Profile encryption key is not configured');
        }

        const normalizedMailingAddress = hasMailingAddress(trimmed.mailingAddress)
          ? trimmed.mailingAddress
          : {
              street: '',
              city: '',
              state: '',
              postalCode: '',
              country: '',
            };

        const encryptedPayload = {
          ...trimmed,
          mailingAddress: hasMailingAddress(trimmed.mailingAddress)
            ? trimmed.mailingAddress
            : null,
        };

        const { ciphertext, iv } = await encryptJson(encryptedPayload, profileKey);

        const payloadFeatures = Array.isArray(profile.features) ? profile.features : [];
        const payloadIsPaid = profile.isPaid ?? false;
        const payloadSubscription = profile.subscriptionPlan ?? null;
        const payloadSettingsId = profile.settingsId ?? null;
        const payloadVersion = profile.version ?? 1;

        await saveEncryptedProfile({
          userId: profile.userId,
          encryptedPayload: ciphertext,
          iv,
          version: payloadVersion,
          features: payloadFeatures,
          isPaid: payloadIsPaid,
          subscriptionPlan: payloadSubscription ?? undefined,
          settingsId: payloadSettingsId ?? undefined,
        });

        const nextState: FormState = {
          ...trimmed,
          mailingAddress: normalizedMailingAddress,
        };

        setProfileData(nextState);
        setDraft(nextState);
        setOpen(false);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Unable to save profile right now.';
        setSubmitError(message);
      } finally {
        setIsSaving(false);
      }
    },
    [canEdit, draft, isSaving, profile.userId, profileKey, saveEncryptedProfile],
  );

  const handleTextChange = useCallback(
    (key: Exclude<keyof FormState, 'mailingAddress' | 'gender' | 'sex' | 'sexuality' | 'gradeLevel' | 'country'>) =>
      (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const value = key === 'bio'
          ? event.target.value.slice(0, BIO_MAX_LENGTH)
          : event.target.value;
        setDraft((prev) => ({ ...prev, [key]: value }));
      },
    [],
  );

  const handleSelectChange = useCallback(
    (key: 'gender' | 'sex' | 'sexuality' | 'gradeLevel' | 'country') =>
      (event: ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setDraft((prev) => ({ ...prev, [key]: value }));
      },
    [],
  );

  const handleMailingAddressChange = useCallback(
    (key: keyof MailingAddress) =>
      (event: ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setDraft((prev) => ({
          ...prev,
          mailingAddress: { ...prev.mailingAddress, [key]: value },
        }));
      },
    [],
  );

  const identityRows = [
    { label: 'Gender', value: formatIdentityLabel(profileData.gender) },
    {
      label: 'Gender (custom)',
      value: profileData.genderCustom || 'Not provided',
      hidden: profileData.gender !== 'other' && !profileData.genderCustom,
    },
    { label: 'Sex', value: formatIdentityLabel(profileData.sex) },
    {
      label: 'Sex (custom)',
      value: profileData.sexCustom || 'Not provided',
      hidden: profileData.sex !== 'other' && !profileData.sexCustom,
    },
    { label: 'Sexuality', value: formatIdentityLabel(profileData.sexuality) },
    {
      label: 'Sexuality (custom)',
      value: profileData.sexualityCustom || 'Not provided',
      hidden: profileData.sexuality !== 'other' && !profileData.sexualityCustom,
    },
  ].filter((row) => !row.hidden);

  return (
    <>
      <GlassCard component="section" sx={{ width: '100%', maxWidth: 640, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          {user.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.avatarUrl}
              alt={`${displayName}'s avatar`}
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                objectFit: 'cover',
              }}
            />
          ) : (
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                bgcolor: 'grey.400',
              }}
            />
          )}

          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" fontWeight={700}>
              {displayName}
            </Typography>
            {user.username ? (
              <Typography variant="body2" color="text.secondary">
                @{user.username}
              </Typography>
            ) : null}
            {joinedDisplay ? (
              <Typography variant="caption" color="text.disabled">
                Joined {joinedDisplay}
              </Typography>
            ) : null}
          </Box>

          {canEdit ? (
            <Button variant="outlined" size="small" onClick={handleOpen}>
              Edit Profile
            </Button>
          ) : null}
        </Stack>

        {canViewSensitive ? (
          displayedBio ? (
            <Typography variant="body1" color="text.primary" sx={{ lineHeight: 1.5 }}>
              {displayedBio}
            </Typography>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
              No bio yet. Share something about yourself!
            </Typography>
          )
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
            Sign in to view this member&apos;s personal details.
          </Typography>
        )}

        {canViewSensitive ? (
          <>
            <Divider flexItem />

            <Stack spacing={1}>
              <Typography variant="subtitle2" color="text.secondary">
                Identity
              </Typography>
              {identityRows.map((row) => (
                <Typography key={row.label} variant="body2">
                  <Typography component="span" variant="body2" color="text.secondary">
                    {row.label}:
                  </Typography>{' '}
                  {row.value}
                </Typography>
              ))}
            </Stack>

            <Divider flexItem />

            <Stack spacing={1}>
              <Typography variant="subtitle2" color="text.secondary">
                Background
              </Typography>
              <Typography variant="body2">
                <Typography component="span" variant="body2" color="text.secondary">
                  Profession:
                </Typography>{' '}
                {profileData.profession || 'Not provided'}
              </Typography>
              <Typography variant="body2">
                <Typography component="span" variant="body2" color="text.secondary">
                  Grade level:
                </Typography>{' '}
                {formatGradeLabel(profileData.gradeLevel)}
              </Typography>
              <Typography variant="body2">
                <Typography component="span" variant="body2" color="text.secondary">
                  Country:
                </Typography>{' '}
                {profileData.country || Country.Other}
              </Typography>
              <Typography variant="body2">
                <Typography component="span" variant="body2" color="text.secondary">
                  Mailing address:
                </Typography>{' '}
                {formatMailingAddress(profileData.mailingAddress)}
              </Typography>
            </Stack>
          </>
        ) : null}
      </GlassCard>

      {canEdit ? (
        <PrimitiveModal
          open={open}
          onClose={handleClose}
          title="Edit profile"
          description="Update your personal details. Changes apply to your profile only."
          maxWidth="md"
          fullWidth
          actions={
            <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ width: '100%' }}>
              <Button onClick={handleClose} disabled={isSaving}>
                Cancel
              </Button>
              <Button
                type="submit"
                form="edit-profile-form"
                variant="contained"
                disabled={isSaving}
              >
                {isSaving ? 'Saving…' : 'Save changes'}
              </Button>
            </Stack>
          }
        >
          <Stack
            id="edit-profile-form"
            component="form"
            onSubmit={handleSubmit}
            spacing={3}
          >
            {submitError ? (
              <Alert severity="error" onClose={() => setSubmitError(null)}>
                {submitError}
              </Alert>
            ) : null}

            <Stack spacing={2}>
              <Typography variant="subtitle2" color="text.secondary">
                Basic details
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  label="First name"
                  name="firstName"
                  value={draft.firstName}
                  onChange={handleTextChange('firstName')}
                  fullWidth
                  autoComplete="given-name"
                />
                <TextField
                  label="Middle name"
                  name="middleName"
                  value={draft.middleName}
                  onChange={handleTextChange('middleName')}
                  fullWidth
                  autoComplete="additional-name"
                />
                <TextField
                  label="Last name"
                  name="lastName"
                  value={draft.lastName}
                  onChange={handleTextChange('lastName')}
                  fullWidth
                  autoComplete="family-name"
                />
              </Stack>

              <TextField
                label="Profession"
                name="profession"
                value={draft.profession}
                onChange={handleTextChange('profession')}
                fullWidth
                autoComplete="organization-title"
              />

              <TextField
                label="Bio"
                name="bio"
                value={draft.bio}
                onChange={handleTextChange('bio')}
                fullWidth
                multiline
                minRows={4}
                helperText={`${draft.bio.length}/${BIO_MAX_LENGTH} characters`}
                inputProps={{ maxLength: BIO_MAX_LENGTH }}
              />
            </Stack>

            <Stack spacing={2}>
              <Typography variant="subtitle2" color="text.secondary">
                Identity
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  select
                  label="Gender"
                  name="gender"
                  value={draft.gender}
                  onChange={handleSelectChange('gender')}
                  fullWidth
                >
                  {GenderValues.map((value) => (
                    <MenuItem key={value} value={value}>
                      {formatIdentityLabel(value)}
                    </MenuItem>
                  ))}
                </TextField>
                {draft.gender === 'other' ? (
                  <TextField
                    label="Gender (custom)"
                    name="genderCustom"
                    value={draft.genderCustom}
                    onChange={handleTextChange('genderCustom')}
                    fullWidth
                  />
                ) : null}
              </Stack>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  select
                  label="Sex"
                  name="sex"
                  value={draft.sex}
                  onChange={handleSelectChange('sex')}
                  fullWidth
                >
                  {SexValues.map((value) => (
                    <MenuItem key={value} value={value}>
                      {formatIdentityLabel(value)}
                    </MenuItem>
                  ))}
                </TextField>
                {draft.sex === 'other' ? (
                  <TextField
                    label="Sex (custom)"
                    name="sexCustom"
                    value={draft.sexCustom}
                    onChange={handleTextChange('sexCustom')}
                    fullWidth
                  />
                ) : null}
              </Stack>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  select
                  label="Sexuality"
                  name="sexuality"
                  value={draft.sexuality}
                  onChange={handleSelectChange('sexuality')}
                  fullWidth
                >
                  {SexualityValues.map((value) => (
                    <MenuItem key={value} value={value}>
                      {formatIdentityLabel(value)}
                    </MenuItem>
                  ))}
                </TextField>
                {draft.sexuality === 'other' ? (
                  <TextField
                    label="Sexuality (custom)"
                    name="sexualityCustom"
                    value={draft.sexualityCustom}
                    onChange={handleTextChange('sexualityCustom')}
                    fullWidth
                  />
                ) : null}
              </Stack>
            </Stack>

            <Stack spacing={2}>
              <Typography variant="subtitle2" color="text.secondary">
                Education & location
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  select
                  label="Grade level"
                  name="gradeLevel"
                  value={draft.gradeLevel}
                  onChange={handleSelectChange('gradeLevel')}
                  fullWidth
                >
                  {GradeLevelValues.map((value) => (
                    <MenuItem key={value} value={value}>
                      {formatGradeLabel(value)}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  select
                  label="Country"
                  name="country"
                  value={draft.country}
                  onChange={handleSelectChange('country')}
                  fullWidth
                >
                  {countryOptions.map((value) => (
                    <MenuItem key={value} value={value}>
                      {value}
                    </MenuItem>
                  ))}
                </TextField>
              </Stack>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  label="Mailing street"
                  name="mailingStreet"
                  value={draft.mailingAddress.street}
                  onChange={handleMailingAddressChange('street')}
                  fullWidth
                  autoComplete="address-line1"
                />
                <TextField
                  label="Mailing city"
                  name="mailingCity"
                  value={draft.mailingAddress.city}
                  onChange={handleMailingAddressChange('city')}
                  fullWidth
                  autoComplete="address-level2"
                />
              </Stack>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  label="Mailing state / region"
                  name="mailingState"
                  value={draft.mailingAddress.state}
                  onChange={handleMailingAddressChange('state')}
                  fullWidth
                  autoComplete="address-level1"
                />
                <TextField
                  label="Postal / ZIP code"
                  name="mailingPostalCode"
                  value={draft.mailingAddress.postalCode}
                  onChange={handleMailingAddressChange('postalCode')}
                  fullWidth
                  autoComplete="postal-code"
                />
              </Stack>

              <TextField
                label="Mailing country"
                name="mailingCountry"
                value={draft.mailingAddress.country}
                onChange={handleMailingAddressChange('country')}
                fullWidth
                autoComplete="country-name"
              />
            </Stack>
          </Stack>
        </PrimitiveModal>
      ) : null}
    </>
  );
}

export default ProfileDetails;
