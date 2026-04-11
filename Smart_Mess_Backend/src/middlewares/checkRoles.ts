import { Response, NextFunction } from "express";

export const checkRoles = (allowedRoles: string[]) => {
    return (req: any, res: Response, next: NextFunction) => {
        console.log("Checking Roles...");
        try {
            const userRole = req.user.role;
            if (userRole === "admin" || allowedRoles.includes(userRole)) {
                console.log(`Role Authorized: ${userRole}`);
                next();
            } else {
                res.status(401).json({
                    message: "You are not authorized to access this specific route."
                });
            }
        } catch (err) {
            res.status(401).json({
                message: "Authorization Verification Failed"
            });
        }
    };
};
