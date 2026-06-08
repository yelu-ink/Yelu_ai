import { AuthorizedStudent, Application } from '../models';
export declare class TeacherService {
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
    static getStudentsOverview(_teacherId: number): Promise<{
        id: number;
        name: string;
        username: string;
        password: string;
        className: string;
        totalApplications: number;
        statusCount: Record<string, number>;
    }[]>;
    static createStudentAccount(name: string, major?: string, studentLink?: string): Promise<{
        userId: number;
        username: string;
        password: string;
        className: string;
        studentLink: string;
    }>;
}
export default TeacherService;
//# sourceMappingURL=teacherService.d.ts.map