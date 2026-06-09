import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare class ApplicationController {
    static create(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static list(req: AuthRequest, res: Response): Promise<void>;
    static get(req: AuthRequest, res: Response): Promise<void>;
    static update(req: AuthRequest, res: Response): Promise<void>;
    static delete(req: AuthRequest, res: Response): Promise<void>;
    static recommendations(req: AuthRequest, res: Response): Promise<void>;
    static ranking(req: AuthRequest, res: Response): Promise<void>;
    static statistics(req: AuthRequest, res: Response): Promise<void>;
    static getPendingWarning(req: AuthRequest, res: Response): Promise<void>;
    static markWarningRead(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
}
export default ApplicationController;
//# sourceMappingURL=applicationController.d.ts.map