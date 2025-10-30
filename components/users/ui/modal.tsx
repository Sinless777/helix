'use client';

import CloseIcon from '@mui/icons-material/Close';
import {
  Dialog,
  DialogActions,
  DialogContent,
  type DialogProps,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import type { ReactNode } from 'react';

export type PrimitiveModalProps = {
  open: boolean;
  onClose: () => void;
  onDialogClose?: DialogProps['onClose'];
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  showCloseButton?: boolean;
  dividers?: boolean;
} & Omit<DialogProps, 'open' | 'onClose' | 'children'>;

export function PrimitiveModal({
  open,
  onClose,
  onDialogClose,
  title,
  description,
  actions,
  children,
  showCloseButton = true,
  dividers = false,
  maxWidth = 'sm',
  fullWidth = true,
  ...dialogProps
}: PrimitiveModalProps) {
  const handleDialogClose: DialogProps['onClose'] = (event, reason) => {
    if (onDialogClose) {
      onDialogClose(event, reason);
    }
    onClose();
  };

  const handleCloseClick = () => {
    onClose();
  };

  const renderTitle = () => {
    if (!title && !description && !showCloseButton) {
      return null;
    }

    return (
      <DialogTitle>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={1}>
          <Stack spacing={0.5} flexGrow={1}>
            {typeof title === 'string' ? (
              <Typography variant="h6">{title}</Typography>
            ) : (
              title
            )}
            {description &&
              (typeof description === 'string' ? (
                <Typography variant="body2" color="text.secondary">
                  {description}
                </Typography>
              ) : (
                description
              ))}
          </Stack>
          {showCloseButton ? (
            <IconButton aria-label="close" edge="end" onClick={handleCloseClick}>
              <CloseIcon fontSize="small" />
            </IconButton>
          ) : null}
        </Stack>
      </DialogTitle>
    );
  };

  return (
    <Dialog
      open={open}
      onClose={handleDialogClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      {...dialogProps}
    >
      {renderTitle()}
      <DialogContent dividers={dividers}>{children}</DialogContent>
      {actions ? <DialogActions>{actions}</DialogActions> : null}
    </Dialog>
  );
}

export default PrimitiveModal;
