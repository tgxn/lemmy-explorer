export class Suspicions {
    constructor(instance: any, log?: boolean);
    baseUrl: any;
    instance: any;
    log: boolean;
    getMetrics(): Promise<{
        userActivityScore: number;
        activityUserScore: number;
        userActiveMonthScore: number;
        usersTotal: any;
        usersMonth: any;
        usersWeek: any;
        totalActivity: any;
        localPosts: any;
        localComments: any;
    }>;
    isSuspiciousReasons(): Promise<string[]>;
    metrics: {
        userActivityScore: number;
        activityUserScore: number;
        userActiveMonthScore: number;
        usersTotal: any;
        usersMonth: any;
        usersWeek: any;
        totalActivity: any;
        localPosts: any;
        localComments: any;
    };
    isSuspicious(): Promise<boolean>;
}
