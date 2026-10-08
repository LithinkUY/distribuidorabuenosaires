const fs = require('fs');
let file = fs.readFileSync('src/components/auth/AuthModal.tsx', 'utf8');

const search = `    const res = loginUser(email, password, rememberMe);
    if (res.success) {
      handleClose();
    } else {`;
    
const replacement = `    const res = loginUser(email, password, rememberMe);
    if (res.success && res.user) {
      handleClose();
      
      const onAdminRoute = window.location.pathname.startsWith('/admin');
      
      if (res.user.role !== 'admin' && onAdminRoute) {
        window.location.href = '/';
      } else if (res.user.role !== 'admin') {
        setTimeout(() => setIsProfileModalOpen(true), 150);
      }
    } else {`;

file = file.replace(search, replacement);

fs.writeFileSync('src/components/auth/AuthModal.tsx', file, 'utf8');
