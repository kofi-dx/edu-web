// lib/constants.ts
export const roleDashboards: Record<string, string> = {
  super_admin: '/platform',
  government_admin: '/ges',
  regional_admin: '/regional',
  district_admin: '/district',
  curriculum_admin: '/nacca',
  analytics_admin: '/analytics',
  school_support: '/support',
  school_admin: '/school',
  teacher: '/teacher',
  student: '/student',
  parent: '/parent',
};

export const roleDisplayNames: Record<string, string> = {
  super_admin: 'Platform Admin',
  government_admin: 'GES Admin',
  regional_admin: 'Regional Director',
  district_admin: 'District Director',
  curriculum_admin: 'NACCA Admin',
  analytics_admin: 'Analytics',
  school_support: 'School Support',
  school_admin: 'School Admin',
  teacher: 'Teacher',
  student: 'Student',
  parent: 'Parent',
};

export const roleLabels: Record<string, string> = {
  super_admin: 'Platform',
  government_admin: 'GES',
  regional_admin: 'Regional',
  district_admin: 'District',
  curriculum_admin: 'NACCA',
  analytics_admin: 'Analytics',
  school_support: 'Support',
  school_admin: 'School',
  teacher: 'Teacher',
  student: 'Student',
  parent: 'Parent',
};