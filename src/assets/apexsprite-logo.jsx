import React from 'react';

export const ApexSpriteLogo = ({ className, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const actualSize = sizeClasses[size] || sizeClasses.md;

  return (
    <div className={`${actualSize} bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-lg flex items-center justify-center ${className}`}>
      <div className="text-white font-bold text-center">AS</div>
    </div>
  );
};

export const ApexSpriteFullLogo = ({ className }) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <ApexSpriteLogo />
      <span className="text-white font-semibold text-lg">ApexSprite</span>
    </div>
  );
};

export default ApexSpriteLogo;