path = r"C:\resale-management-system\frontend\src\layouts\MainLayout.jsx"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update lucide import to add Store and PhoneCall
old_import = "import { LayoutDashboard, Building2, ListChecks, Users, LogOut, Menu, X, ChevronDown } from 'lucide-react';"
new_import = "import { LayoutDashboard, Building2, ListChecks, Users, LogOut, Menu, X, ChevronDown, Store, PhoneCall } from 'lucide-react';"
assert old_import in content, "import not found"
content = content.replace(old_import, new_import)

# 2. Update navItems
old_nav = """  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/units', label: 'Units', icon: ListChecks },
    { path: '/developers', label: 'Developers', icon: Building2, roles: ['admin', 'manager'] },
    { path: '/compounds', label: 'Compounds', icon: Building2, roles: ['admin', 'manager'] },
  ].filter(item => !item.roles || hasRole(item.roles));"""

new_nav = """  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/marketplace', label: 'Marketplace', icon: Store },
    { path: '/units', label: 'Units', icon: ListChecks },
    { path: '/phone-requests', label: 'Phone Requests', icon: PhoneCall, roles: ['admin', 'manager'] },
    { path: '/developers', label: 'Developers', icon: Building2, roles: ['admin', 'manager'] },
    { path: '/compounds', label: 'Compounds', icon: Building2, roles: ['admin', 'manager'] },
  ].filter(item => !item.roles || hasRole(item.roles));"""

assert old_nav in content, "navItems not found"
content = content.replace(old_nav, new_nav)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print("MainLayout.jsx updated successfully")
