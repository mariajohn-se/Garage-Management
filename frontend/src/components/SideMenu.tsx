import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { MENU_GROUPS, canSeeLink } from '../config/menuGroups';

function groupContainsPath(group: (typeof MENU_GROUPS)[number], pathname: string): boolean {
  return group.links.some((link) => pathname === link.to || pathname.startsWith(`${link.to}/`));
}

/**
 * NavLink's own prefix matching (isActive) lights up EVERY link whose `to` is a prefix of the
 * current path - e.g. both "Sales Orders" (/orders) and "Order Lookup" (/orders/help) match
 * simultaneously while on /orders/help, since /orders/help starts with /orders too. Only the
 * longest (most specific) matching link across all groups should actually highlight.
 */
function findMostSpecificMatch(groups: (typeof MENU_GROUPS)[number][], pathname: string): string | null {
  let best: string | null = null;
  for (const group of groups) {
    for (const link of group.links) {
      const matches = pathname === link.to || pathname.startsWith(`${link.to}/`);
      if (matches && (best === null || link.to.length > best.length)) {
        best = link.to;
      }
    }
  }
  return best;
}

export function SideMenu() {
  const { session } = useAuth();
  const location = useLocation();
  const isPrivileged = !!session?.roles.some((r) => r === 'Supervisor' || r === 'Administrator');
  const isAdmin = !!session?.roles.includes('Administrator');

  const [expanded, setExpanded] = useState<Set<string>>(() => {
    const active = MENU_GROUPS.find((g) => groupContainsPath(g, location.pathname));
    return new Set(active ? [active.title] : []);
  });

  useEffect(() => {
    const active = MENU_GROUPS.find((g) => groupContainsPath(g, location.pathname));
    if (active) {
      setExpanded((prev) => (prev.has(active.title) ? prev : new Set(prev).add(active.title)));
    }
  }, [location.pathname]);

  function toggleGroup(title: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(title)) {
        next.delete(title);
      } else {
        next.add(title);
      }
      return next;
    });
  }

  const visibleGroups = MENU_GROUPS.map((group) => ({
    ...group,
    links: group.links.filter((link) => canSeeLink(link, isPrivileged, isAdmin))
  })).filter((group) => group.links.length > 0);

  const activeLinkTo = findMostSpecificMatch(visibleGroups, location.pathname);

  return (
    <nav className="side-menu" aria-label="Main navigation">
      <Link to="/home" className={`side-menu-home-link ${location.pathname === '/home' ? 'is-active' : ''}`}>
        <span className="side-menu-icon" aria-hidden="true">
          &#127968;
        </span>
        Dashboard
      </Link>
      <div className="side-menu-section-label">Menu</div>
      <ul className="side-menu-groups">
        {visibleGroups.map((group) => {
          const isOpen = expanded.has(group.title);
          const isActiveGroup = groupContainsPath(group, location.pathname);
          return (
            <li key={group.title} className="side-menu-group">
              <button
                type="button"
                className={`side-menu-group-btn ${isActiveGroup ? 'is-active-group' : ''}`}
                aria-expanded={isOpen}
                onClick={() => toggleGroup(group.title)}
              >
                <span className="side-menu-icon" aria-hidden="true">
                  {group.icon}
                </span>
                <span className="side-menu-group-label">{group.title}</span>
                <span className={`side-menu-chevron ${isOpen ? 'is-open' : ''}`} aria-hidden="true">
                  &#9656;
                </span>
              </button>
              <ul className={`side-menu-sublist ${isOpen ? 'is-open' : ''}`}>
                {group.links.map((link) => (
                  <li key={link.to}>
                    <NavLink to={link.to} className={link.to === activeLinkTo ? 'is-active' : ''}>
                      {link.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
