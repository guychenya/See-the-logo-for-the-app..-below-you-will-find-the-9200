import React from 'react';
import * as FiIcons from 'react-icons/fi';
import { FiAlertTriangle } from 'react-icons/fi';

const SafeIcon = ({ icon, name, ...props }) => {
  let IconComponent;

  try {
    // If icon prop is provided, use it directly
    if (icon) {
      IconComponent = icon;
    } 
    // If name prop is provided, try to find it in FiIcons
    else if (name && typeof name === 'string') {
      const iconName = name.startsWith('Fi') ? name : `Fi${name}`;
      IconComponent = FiIcons[iconName];
    }

    // Validate that we have a valid component
    if (!IconComponent || typeof IconComponent !== 'function') {
      throw new Error('Invalid icon component');
    }

    return React.createElement(IconComponent, props);
  } catch (e) {
    console.warn('SafeIcon: Failed to render icon, using fallback', { icon, name, error: e.message });
    return <FiAlertTriangle {...props} />;
  }
};

export default SafeIcon;