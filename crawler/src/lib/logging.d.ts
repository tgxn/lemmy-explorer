export default logging;
declare namespace logging {
    function silly(): void;
    let trace: {
        (...data: any[]): void;
        (message?: any, ...optionalParams: any[]): void;
    };
    let verbose: {
        (...data: any[]): void;
        (message?: any, ...optionalParams: any[]): void;
    };
    let debug: {
        (...data: any[]): void;
        (message?: any, ...optionalParams: any[]): void;
    };
    let info: {
        (...data: any[]): void;
        (message?: any, ...optionalParams: any[]): void;
    };
    let warn: {
        (...data: any[]): void;
        (message?: any, ...optionalParams: any[]): void;
    };
    let error: {
        (...data: any[]): void;
        (message?: any, ...optionalParams: any[]): void;
    };
    let fatal: {
        (...data: any[]): void;
        (message?: any, ...optionalParams: any[]): void;
    };
}
