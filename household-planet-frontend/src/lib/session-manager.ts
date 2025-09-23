class SessionManager {
  private validationInterval: NodeJS.Timeout | null = null;

  init() {
    this.startValidation();
  }

  private startValidation() {
    this.validationInterval = setInterval(() => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          if (payload.exp * 1000 < Date.now()) {
            this.cleanup();
          }
        } catch {
          this.cleanup();
        }
      }
    }, 60000); // Check every minute
  }

  cleanup() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (this.validationInterval) {
      clearInterval(this.validationInterval);
    }
    window.location.href = '/admin/login';
  }

  destroy() {
    if (this.validationInterval) {
      clearInterval(this.validationInterval);
    }
  }
}

export const sessionManager = new SessionManager();