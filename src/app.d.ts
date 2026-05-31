declare global {
	namespace App {
		interface User {
			_id: string;
			email: string;
			name: string;
			role: 'admin' | 'user';
		}

		interface Locals {
			user: User | null;
		}
	}
}

export {};
