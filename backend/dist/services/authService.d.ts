import { User } from '../models';
export declare class AuthService {
    static registerStudent(username: string, password: string, name: string, className: string, email?: string, phone?: string): Promise<{
        user: {
            id: number;
            username: string;
            name: string;
            className: string | undefined;
            role: "student" | "teacher";
        };
        token: string;
    }>;
    static login(username: string, password: string): Promise<{
        user: {
            id: number;
            username: string;
            name: string;
            className: string | undefined;
            role: "student" | "teacher";
        };
        token: string;
    }>;
    private static generateToken;
    static getUserProfile(userId: number): Promise<User>;
    static updateUserProfile(userId: number, updates: {
        name?: string;
        email?: string;
        phone?: string;
    }): Promise<{
        id: number;
        username: string;
        name: string;
        email: string | undefined;
        phone: string | undefined;
        className: string | undefined;
        role: "teacher";
    }>;
}
export default AuthService;
//# sourceMappingURL=authService.d.ts.map