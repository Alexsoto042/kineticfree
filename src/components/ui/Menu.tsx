import { useState, useRef, useEffect, type ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { FiChevronDown } from 'react-icons/fi';
import './Menu.css';

// --- Types ---
interface MenuItemBase {
  icon?: ReactNode;
  isSeparator?: boolean;
}

interface MenuLinkItem extends MenuItemBase {
  label: string;
  to: string;
  onClick?: never;
}

interface MenuButtonItem extends MenuItemBase {
  label: string;
  to?: never;
  onClick: () => void;
}

interface MenuSeparatorItem extends MenuItemBase {
  isSeparator: true;
  label?: never;
  to?: never;
  onClick?: never;
  icon?: never;
}

export type MenuItemType = MenuLinkItem | MenuButtonItem | MenuSeparatorItem;

interface MenuProps {
  trigger: ReactNode;
  items: MenuItemType[];
  variant?: 'dropdown' | 'collapsible';
  // --- Collapsible specific props ---
  collapsibleTitle?: string;
  collapsibleIcon?: ReactNode;
  isOpen?: boolean;
  onToggle?: () => void;
}

// --- Component ---
export function Menu({
  trigger,
  items,
  variant = 'dropdown',
  collapsibleTitle,
  collapsibleIcon,
  isOpen: isControlledOpen,
  onToggle,
}: MenuProps) {
  const [isUncontrolledOpen, setIsUncontrolledOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isOpen = onToggle ? isControlledOpen : isUncontrolledOpen;
  const handleToggle = onToggle ? onToggle : () => setIsUncontrolledOpen((prev) => !prev);

  // --- Click outside to close (for dropdown) ---
  useEffect(() => {
    if (variant !== 'dropdown') return;

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsUncontrolledOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [variant]);

  const handleItemClick = (itemOnClick?: () => void) => {
    if (itemOnClick) {
      itemOnClick();
    }
    if (!onToggle) {
      setIsUncontrolledOpen(false);
    }
  };

  // --- Render ---
  if (variant === 'collapsible') {
    return (
      <div className="collapsible-menu">
        <button className="collapsible-trigger" onClick={handleToggle}>
          <div className="trigger-content">
            {collapsibleIcon}
            <span>{collapsibleTitle}</span>
          </div>
          <FiChevronDown className={`chevron ${isOpen ? 'is-open' : ''}`} />
        </button>
        {isOpen && (
          <div className={`collapsible-content ${isOpen ? 'is-open' : ''}`}>
            {items.map((item, index) => (
              <NavLink
                key={item.to || index}
                to={item.to!}
                className="collapsible-nav-link"
                onClick={() => handleItemClick(item.onClick)}
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        )}
      </div>
    );
  }

  // --- Default to dropdown variant ---
  return (
    <div className="dropdown" ref={menuRef}>
      <div className="dropdown-trigger" onClick={handleToggle}>
        {trigger}
      </div>
      {isOpen && (
        <div className="dropdown-content">
          {items.map((item, index) => {
            if (item.isSeparator) {
              return <hr key={index} className="dropdown-separator" />;
            }

            if (item.to) {
              return (
                <NavLink
                  key={index}
                  to={item.to}
                  className={({ isActive }) =>
                    isActive ? 'dropdown-item active' : 'dropdown-item'
                  }
                  onClick={() => handleItemClick()}
                >
                  {item.icon && <span className="dropdown-item-icon">{item.icon}</span>}
                  {item.label}
                </NavLink>
              );
            }

            if (item.onClick) {
              return (
                <button
                  key={index}
                  className="dropdown-item button"
                  onClick={() => handleItemClick(item.onClick)}
                >
                  {item.icon && <span className="dropdown-item-icon">{item.icon}</span>}
                  {item.label}
                </button>
              );
            }
            return null;
          })}
        </div>
      )}
    </div>
  );
}
