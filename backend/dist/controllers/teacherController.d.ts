import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare class TeacherController {
    static getUploadMiddleware(): import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
    static importStudents(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static getStudentsOverview(req: AuthRequest, res: Response): Promise<void>;
    static getStudents(req: AuthRequest, res: Response): Promise<void>;
    static getClasses(req: AuthRequest, res: Response): Promise<void>;
    static getClassStatistics(req: AuthRequest, res: Response): Promise<void>;
    static getOverallStatistics(req: AuthRequest, res: Response): Promise<void>;
    static getAllApplications(req: AuthRequest, res: Response): Promise<void>;
    static exportApplications(req: AuthRequest, res: Response): Promise<void>;
    static createStudentAccount(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static getStudentStatistics(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static updateStudentAccount(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static deleteStudentAccount(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static sendApplicationWarning(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
}
export default TeacherController;
//# sourceMappingURL=teacherController.d.ts.map