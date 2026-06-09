import { Application } from '../models';
interface ApplicationFilters {
    channel?: string;
    type?: string;
    status?: string;
    priority?: number;
    startDate?: string;
    endDate?: string;
    company?: string;
    position?: string;
}
export declare class ApplicationService {
    static createApplication(userId: number, data: {
        company: string;
        position: string;
        applicationDate: string;
        channel?: string;
        type?: string;
        status?: string;
        statusDate?: string;
        location?: string;
        referralCode?: string;
        priority?: number;
        remarks?: string;
    }): Promise<Application>;
    static getUserApplications(userId: number, filters?: ApplicationFilters): Promise<Application[]>;
    static getApplicationById(id: number, userId: number): Promise<Application>;
    static updateApplication(id: number, userId: number, updates: Partial<Application>): Promise<Application>;
    static deleteApplication(id: number, userId: number): Promise<boolean>;
    static countRecentApplications(userId: number, days?: number): Promise<number>;
    static getStatistics(userId: number): Promise<{
        total: number;
        statusCount: Record<string, number>;
        typeCount: Record<string, number>;
        channelCount: Record<string, number>;
        trend: Record<string, number>;
    }>;
    static getApplicationRanking(currentUserId: number): Promise<{
        rankings: never[];
        currentRank: number;
        totalStudents: number;
        isBottom40: boolean;
        warningMessage?: undefined;
    } | {
        rankings: {
            rank: number;
            maskedName: string;
            className: string;
            totalApplications: number;
            isCurrentUser: boolean;
        }[];
        currentRank: number;
        totalStudents: number;
        isBottom40: boolean;
        warningMessage: string | undefined;
    }>;
    static getApplicationRecommendations(): Promise<{
        company: string;
        position: string;
        applicationDate: string;
        channel?: string;
        type?: string;
        location?: string;
        status?: string;
        applicationCount: number;
    }[]>;
}
export default ApplicationService;
//# sourceMappingURL=applicationService.d.ts.map