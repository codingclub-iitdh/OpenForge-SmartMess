// component
import SvgColor from '../../../components/svg-color';

// ----------------------------------------------------------------------

const icon = (name) => <SvgColor src={`/assets/icons/navbar/${name}.svg`} sx={{ width: 1, height: 1 }} />;

const navConfig = [
  {
    title: 'Student Dashboard',
    path: '/dashboard/app',
    icon: icon('ic_analytics'),
    roles: ["user"],
  },
  {
    title: 'Menu',
    path: '/dashboard/menuPage',
    icon: icon('ic_menu'),
    roles: ["user"],
  },
  {
    title: 'Feedback',
    path: '/dashboard/products',
    icon: icon('ic_cart'),
    roles: ["user"],
  },
  {
    title: 'Rating',
    path: '/dashboard/ratings',
    icon: icon('ic_blog'),
    roles: ["user"],
  },
  {
    title: 'Edit Food Item',
    path: '/dashboard/addfooditem',
    icon: icon('ic_disabled'),
    roles: ["manager", "secy"],
  },
  {
    title: 'Manager Portal',
    path: '/dashboard/summary',
    icon: icon('ic_summary'),
    roles: ["manager", "secy", "dean"],
  },
  {
    title: 'Analytics',
    path: '/dashboard/analytics',
    icon: icon('ic_charts'),
    roles: ["user", "manager", "secy", "dean"],
  },
  {
    title: 'Add Announcement',
    path: '/dashboard/announcement',
    icon: icon('ic_summary'),
    roles: ["manager", "secy", "dean"],
  },
  {
    title: 'Issues',
    path: '/dashboard/suggestions',
    icon: icon('ic_issues'),
    roles: ["user", "manager", "secy", "dean", "admin"],
  }
];

export default navConfig;