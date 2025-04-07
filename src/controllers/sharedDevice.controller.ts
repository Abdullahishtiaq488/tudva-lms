import { Request, Response } from 'express';
import * as sharedDeviceService from '../services/sharedDevice.service';

export const login = async (req: Request, res: Response) => {
    try {
        const { deviceId, userCredentials, sessionId } = req.body;
        const result = await sharedDeviceService.sharedDeviceLogin(deviceId, userCredentials, sessionId);
        res.status(200).json(result);
    } catch (error: any) {
        res.status(400).json({ success: false, error: error.message });
    }
};