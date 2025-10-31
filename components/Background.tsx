import { Box } from '@mui/material';
import Image from 'next/image';
import React from 'react';

export interface BackgroundImageProps {
  imageUrl: string;
  altText: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export const BackgroundImage: React.FC<BackgroundImageProps> = ({
  imageUrl,
  altText,
  style,
  children,
}) => {
  return React.createElement(
    React.Fragment,
    null,
    React.createElement(
      Box,
      {
        sx: {
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: -1,
          backgroundColor: '#000', // fallback behind the image
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'hidden',
        } as any,
      },
      React.createElement(Image, {
        src: imageUrl,
        alt: altText,
        quality: 100,
        fill: true,
        priority: true,
        style: {
          objectFit: 'fill', // show entire image
          objectPosition: 'center', // center it
        },
      })
    ),
    React.createElement(
      Box,
      {
        sx: {
          position: 'relative',
          zIndex: 0,
          ...(style ?? {}),
        } as any,
      },
      children
    )
  );
};

export default BackgroundImage;
