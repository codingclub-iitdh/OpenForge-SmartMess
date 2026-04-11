import { Request, Response } from 'express';
import { getGoogleOauthTokenWeb, getGoogleOauthTokenAndroid } from '../services/getGoogleOauthToken';
import { getGoogleUser } from '../services/getGoogleUser';
import user_model from '../models/user';
import { createSession } from '../services/createSession';
import { JWTLoadData } from '../Interface/interfaces';
import { sendNotification } from '../config/firebaseWeb';
import Analytics from '../models/analytics';

const webSigninHandler = async (req: Request, res: Response): Promise<Response | undefined> => {
    try {
        const { authCode, requestedRole } = req.body;
        console.log("Incoming Login Request:", req.body);
        if (!authCode) return res.status(400).send("authCode not provided");
        // Handle web signup
        try {
            const tokeninfo = await getGoogleOauthTokenWeb({ authCode });
            try {
                const userInfo = await getGoogleUser(tokeninfo);
                //check if user already exists
                let user = await user_model.findOne({ Email: userInfo.email });
                let isNewUser = false;
                // Determine maximum user role from .env whitelists
                let maxRole = "user";
                const managerEmails = process.env.MESS_MANAGER_EMAILS?.split(',').map(e => e.trim()) || [];
                const secyEmails = process.env.MESS_SECY_EMAILS?.split(',').map(e => e.trim()) || [];
                const deanEmails = process.env.DEAN_SW_EMAILS?.split(',').map(e => e.trim()) || [];

                console.log("=== ROLE DEBUG ===");
                console.log("Authenticating Email:", userInfo.email);
                console.log("Parsed Manager Emails:", managerEmails);
                console.log("==================");

                if (managerEmails.includes(userInfo.email)) maxRole = "manager";
                else if (secyEmails.includes(userInfo.email)) maxRole = "secy";
                else if (deanEmails.includes(userInfo.email)) maxRole = "dean";

                if (!user) {
                    //create new user
                    const newUser = await user_model.create({
                        Username: userInfo.name,
                        Email: userInfo.email,
                        Phone_Number: 0,
                        Role: maxRole,
                        First_Name: userInfo.given_name,
                        Last_Name: userInfo.family_name,
                        Image: userInfo.picture,
                        // Eating_Mess: null,
                        Last_Login: Date.now()
                    });
                    user = newUser;
                    isNewUser = true;
                } else {
                    // Sync user role with the current whitelist
                    if (user.get('Role') !== maxRole) {
                        user.set('Role', maxRole);
                        await user.save();
                    }
                }
                const today = new Date();
                today.setHours(0, 0, 0, 0);
        
                const analyticsRecord = await Analytics.findOne({ date: today });
                if (analyticsRecord) {
                    // If record exists for today and the user's ID is not in visitorIds, add it
                    if (!analyticsRecord.visitorIds.includes(user._id.toString())) {
                        analyticsRecord.visitorIds.push(user._id.toString());
                        analyticsRecord.uniqueVisitorsCount += 1;
                        await analyticsRecord.save();
                        console.log("Updated analytics record for today:", analyticsRecord); // Log updated analytics record
                    }
                } else {
                    // If no record exists for today, create a new one
                    const newRecord =   await Analytics.create({
                        date: today,
                        uniqueVisitorsCount: 1,
                        visitorIds: [user._id.toString()]
                    });
                    console.log("Created new analytics record for today:" , newRecord);
                }
                // console.log(user);
                // Determine the ACTIVE Role for this session
                let activeRole = maxRole;
                
                if (requestedRole) {
                    if (requestedRole === 'user') {
                        activeRole = 'user'; // Anyone can log in as a student
                    } else if (requestedRole === 'manager' && ['manager', 'secy', 'dean'].includes(maxRole)) {
                        activeRole = 'manager';
                    } else if (requestedRole === 'dean' && maxRole === 'dean') {
                        activeRole = 'dean';
                    } else {
                        return res.status(403).json({ message: "You don't have authorization for this portal." });
                    }
                }

                //create session
                const payload: JWTLoadData = {
                    user: {
                        email: user.Email,
                        role: activeRole,
                        time: Date.now(),
                    },
                };
                const token = createSession(payload);
                
                // Return explicitly requested role to frontend so routing works correctly
                const returnUser = user.toObject();
                returnUser.Role = activeRole as any;

                console.log("=== ROLE DEBUG ===");
                console.log("Requested Role:", requestedRole);
                console.log("Max Role:", maxRole);
                console.log("Active Session Role Generated:", activeRole);
                console.log("Returned User Role Object:", returnUser.Role);
                console.log("==================");

                if (isNewUser) return res.status(201).json({ token, user: returnUser });
                return res.status(200).json({ token, user: returnUser });
                //
            } catch (err) {
                console.log(err);
                return res.status(500).send("Some Error Occured while fetching user info");
            }
        } catch (err) {
            console.log(err);
            return res.status(500).send("Some Error Occured while access token");
        }
    } catch {
        return res.status(500).send("Some Error Occured");
    }
}

const androidSigninHandler = async (req: Request, res: Response): Promise<Response | undefined> => {
    try {
        const {Email,Username,Image,First_Name,Last_Name} = req.body;
        console.log(req.body);
        let user = await user_model.findOne({ Email: Email });
        let isNewUser = false;
        // Determine user role from .env whitelists
        let assignedRole = "user";
        const managerEmails = process.env.MESS_MANAGER_EMAILS?.split(',').map(e => e.trim()) || [];
        const secyEmails = process.env.MESS_SECY_EMAILS?.split(',').map(e => e.trim()) || [];
        const deanEmails = process.env.DEAN_SW_EMAILS?.split(',').map(e => e.trim()) || [];

        console.log("=== ROLE DEBUG ===");
        console.log("Authenticating Email:", Email);
        console.log("Parsed Manager Emails:", managerEmails);
        console.log("==================");

        if (managerEmails.includes(Email)) assignedRole = "manager";
        else if (secyEmails.includes(Email)) assignedRole = "secy";
        else if (deanEmails.includes(Email)) assignedRole = "dean";

        if (!user) {
            //create new user
            const newUser = await user_model.create({
                Username: Username,
                Email: Email,
                Phone_Number: 0,
                Role: assignedRole,
                First_Name: First_Name,
                Last_Name: Last_Name,
                Image: Image,
                // Eating_Mess: null,
                Last_Login: Date.now()
            });
            user = newUser;
            isNewUser = true;
        } else {
            // Sync user role with the current whitelist
            if (user.get('Role') !== assignedRole) {
                user.set('Role', assignedRole);
                await user.save();
            }
        }
        // console.log(user);
        //create session
        const payload: JWTLoadData = {
            user: {
                email: user.Email,
                role: user.Role as string,
                time: Date.now(),
            },
        };
        const token = createSession(payload);
        if (isNewUser) return res.status(201).json({ token, user });
        return res.status(200).json({ token, user });
    } catch {
        return res.status(500).send("Some Error Occured");
    }
}


export { webSigninHandler,androidSigninHandler };