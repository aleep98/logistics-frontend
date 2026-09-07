export function isAdmin(): boolean {
  try {
    return !!localStorage.getItem('authToken') &&
      JSON.parse(localStorage.getItem('user') || 'null')?.role === 'admin';
  } catch {
    return false;
  }
}
