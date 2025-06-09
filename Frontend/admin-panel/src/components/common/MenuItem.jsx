import React from 'react';

// Basic MenuItem, can be expanded for submenus
const MenuItem = ({ href, iconClass, text, i18nKey, isActive, isToggle, target, children }) => {
  const linkClasses = `menu-link ${isToggle ? 'menu-toggle' : ''}`;
  const itemClasses = `menu-item ${isActive ? 'active' : ''}`;

  return (
    <li className={itemClasses}>
      <a href={href || "#!"} className={linkClasses} target={target} rel={target === "_blank" ? "noopener noreferrer" : undefined}>
        {iconClass && <i className={`menu-icon tf-icons bx ${iconClass}`}></i>}
        <div data-i18n={i18nKey}>{text}</div>
      </a>
      {children && <ul className="menu-sub">{children}</ul>}
    </li>
  );
};

const MenuHeader = ({ text }) => (
  <li className="menu-header small text-uppercase">
    <span className="menu-header-text">{text}</span>
  </li>
);


export { MenuItem, MenuHeader };