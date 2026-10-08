const fs = require('fs');
let file = fs.readFileSync('src/context/StoreContext.tsx', 'utf8');

file = file.replace(
  /const loginUser = \(email: string, password: string, rememberMe = true\): \{ success: boolean; error\?: string; user\?: User \} => \{[\s\S]*?return \{ success: true \};\s*\};/g,
  (match) => match.replace('return { success: true };', 'return { success: true, user: updatedUser };')
);

fs.writeFileSync('src/context/StoreContext.tsx', file, 'utf8');
