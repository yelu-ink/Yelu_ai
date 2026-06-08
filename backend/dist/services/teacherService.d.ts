import { AuthorizedStudent, Application } from '../models';
export declare class TeacherService {
    private static assertStudentOwnedByTeacher;
    private static getTeacherStudentUserIds;
    static importAuthorizedStudents(students: Array<{
        name: string;
        className: string;
    }>, teacherId: number): Promise<AuthorizedStudent[]>;
    static getManagedStudents(teacherId: number, className?: string): Promise<AuthorizedStudent[]>;
    static getClassNames(teacherId: number): Promise<any[]>;
    static getClassStatistics(className: string, teacherId: number): Promise<{
        className: string;
        studentCount: number;
        totalApplications: number;
        avgApplications: string;
        statusCount: Record<string, number>;
        studentRanks: {
            studentId: number;
            studentName: string;
            count: number;
        }[];
    }>;
    static getOverallStatistics(teacherId: number): Promise<{
        totalClasses: number;
        totalStudents: number;
        totalApplications: number;
        statusCount: Record<string, number>;
    }>;
    static getAllApplications(teacherId: number, filters?: {
        className?: string;
        status?: string;
        channel?: string;
        type?: string;
        startDate?: string;
        endDate?: string;
    }): Promise<Application[]>;
    static resolveUniqueUsername(name: string): Promise<string>;
    static getStudentsOverview(teacherId: number): Promise<{
        id: number;
        name: string;
        username: string;
        password: string;
        studentLink: string;
        className: string;
        totalApplications: number;
        statusCount: Record<string, number>;
    }[]>;
    static createStudentAccount(teacherId: number, name: string, major?: string, studentLink?: string): Promise<{
        userId: number;
        username: string;
        password: string;
        className: string;
        studentLink: string;
    }>;
    static updateStudentAccount(teacherId: number, userId: number, data: {
        name: string;
        username: string;
        password: string;
        className?: string;
        studentLink?: string;
    }): Promise<{
        id: number;
        name: string;
        username: string;
        password: string;
        className: string;
        studentLink: string;
    }>;
    static deleteStudentAccount(teacherId: number, userId: number): Promise<boolean>;
}
export default TeacherService;
//# sourceMappingURL=teacherService.d.ts.map