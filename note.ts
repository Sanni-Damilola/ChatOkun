import { NextFunction, Request, Response } from "express";
import { AsyncHandler } from "../Middlewares/AsyncHandler";
import { HTTPCODES, MainAppError } from "../Utils/MainAppError";
import bcrypt from "bcrypt";
import crypto from "crypto";
import UserModels from "../Models/UserModels";
import StaffModels from "../Models/StaffsModels";
import {
  ForgetPasswordEmail,
  UserLoginNotification,
  VerifyAccountByOTP,
  WelComeEmail,
} from "../email/UserEmail";
import mongoose from "mongoose";
import otpgenerator from "otp-generator";
import { v4 as uuidv4 } from "uuid";
import { EnvironmentVariables } from "../Config/EnvironmentVariables";
import TransactionModels from "../Models/TransactionModels";
import { addMinutes, isAfter } from "date-fns";
import { format } from "date-fns";

// User Registration
export const UsersRegistration = AsyncHandler(
  async (req: any, res: Response, next: NextFunction) => {
    const { firstName, phoneNumber, email, password, referralCode } = req.body;

    const token = crypto.randomBytes(48).toString("hex");

    const OTP = otpgenerator.generate(4, {
      upperCaseAlphabets: false,
      specialChars: false,
      digits: true,
      lowerCaseAlphabets: false,
    });

    const otpExpiryTimestamp = addMinutes(new Date(), 5);

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const findUser = await UserModels.findOne({ email });

    if (findUser) {
      return next(
        new MainAppError({
          message: "This account already exists",
          httpcode: HTTPCODES.FORBIDDEN,
        })
      );
    }

    const FindReferredStaff = await StaffModels.findOne({
      specialCode: referralCode,
    });

    if (referralCode === undefined) {
      const users = await UserModels.create({
        firstName,
        phoneNumber,
        email,
        role: "User",
        referredStaff: null,
        OTP,
        OTPExpiry: otpExpiryTimestamp,
        token,
        password: hashedPassword,
        confirmPassword: hashedPassword,
        isVerified: false,
        availableBalance: 0,
        totalSavingsAmount: 0,
        totalInvestmentAmount: 0,
        TopUpBalance: 0,
      });

      VerifyAccountByOTP(users);

      return res.status(201).json({
        message: "Successfully created User",
        data: users?._id,
      });
    } else if (!FindReferredStaff) {
      return next(
        new MainAppError({
          message: "Staff with this Referral Code does not exist",
          httpcode: HTTPCODES.FORBIDDEN,
        })
      );
    } else if (FindReferredStaff?.isVerified !== true) {
      return next(
        new MainAppError({
          message:
            "Staff is not verified. Cannot create an account with this code",
          httpcode: HTTPCODES.BAD_REQUEST,
        })
      );
    } else {
      const users = await UserModels.create({
        firstName,
        phoneNumber,
        email,
        role: "User",
        referredStaff: FindReferredStaff?.firstName,
        OTP,
        OTPExpiry: otpExpiryTimestamp,
        token,
        password: hashedPassword,
        confirmPassword: hashedPassword,
        isVerified: false,
        availableBalance: 0,
        totalInvestmentAmount: 0,
        totalSavingsAmount: 0,
        TopUpBalance: 0,
      });

      VerifyAccountByOTP(users);

      FindReferredStaff?.referrals.push(
        new mongoose.Types.ObjectId(users?._id)
      );
      FindReferredStaff?.save();

      return res.status(201).json({
        message: "Successfully created User",
        data: users?._id,
      });
    }
  }
);

// Resend OTP
export const resendOTP = AsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userID } = req.params;
    const getUser = await UserModels.findById(userID);

    const otpExpiryTimestamp = addMinutes(new Date(), 5);

    const generateNew = otpgenerator.generate(4, {
      upperCaseAlphabets: false,
      specialChars: false,
      digits: true,
      lowerCaseAlphabets: false,
    });
    if (getUser) {
      const User = await UserModels.findByIdAndUpdate(
        getUser?._id,
        {
          OTP: generateNew,
          OTPExpiry: otpExpiryTimestamp,
        },
        { new: true }
      );
      VerifyAccountByOTP(User);
      return res.status(HTTPCODES.OK).json({
        message: "OTP Sent",
      });
    } else {
      return next(
        new MainAppError({
          message: "Wrong OTP",
          httpcode: HTTPCODES.BAD_REQUEST,
        })
      );
    }
  }
);

// User Verification
export const UsersVerification = AsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { OTP } = req.body;
    const getUser = await UserModels.findOne({ OTP });

    if (getUser) {
      const currentTimestamp = new Date();
      const otpExpiry = new Date(getUser.OTPExpiry);

      if (isAfter(currentTimestamp, otpExpiry)) {
        return next(
          new MainAppError({
            message: "OTP has expired",
            httpcode: HTTPCODES.BAD_REQUEST,
          })
        );
      }

      const User = await UserModels.findByIdAndUpdate(
        getUser?._id,
        {
          OTP: "empty",
          isVerified: true,
        },
        { new: true }
      );
      WelComeEmail(getUser);
      return res.status(HTTPCODES.OK).json({
        message: "User Verification Successfull, proceed to Login",
      });
    } else {
      return next(
        new MainAppError({
          message: "Wrong OTP",
          httpcode: HTTPCODES.BAD_REQUEST,
        })
      );
    }
  }
);

// Users Login:
export const UsersLogin = AsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    const CheckUser = await UserModels.findOne({ email });

    if (!CheckUser) {
      return next(
        new MainAppError({
          message: "Email or password not correct",
          httpcode: HTTPCODES.CONFLICT,
        })
      );
    }
    const CheckPassword = await bcrypt.compare(password, CheckUser?.password!);
    if (!CheckPassword) {
      return next(
        new MainAppError({
          message: "Email or password not correct",
          httpcode: HTTPCODES.CONFLICT,
        })
      );
    }
    if (CheckUser?.isVerified && CheckUser?.OTP === "empty") {
      const GetDeviceName = req.get("User-Agent");
      const deviceExists = CheckUser.loggedInDevice.some(
        (device) => device.deviceName === GetDeviceName
      );

      if (!deviceExists) {
        const response = await fetch(
          "http://worldclockapi.com/api/json/utc/now"
        );
        const data = await response.json();
        const cloudTime = new Date(data.currentDateTime);

        const formattedDateTime = cloudTime.toLocaleString("en-US", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "numeric",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        });

        const logoInData = {
          deviceName: GetDeviceName,
          getTimeAndDate: formattedDateTime,
        };
        await CheckUser?.loggedInDevice?.push(logoInData);
        CheckUser?.save();
        UserLoginNotification(CheckUser, GetDeviceName, formattedDateTime);
        return res.status(HTTPCODES.OK).json({
          message: "User Login successfull",
          data: CheckUser?._id,
        });
      } else {
        return res.status(HTTPCODES.OK).json({
          message: "User Login successfull",
          data: CheckUser?._id,
        });
      }
    } else {
      return next(
        new MainAppError({
          message: "User not Verified",
          httpcode: HTTPCODES.NOT_FOUND,
        })
      );
    }
  }
);
export const LogOutFromAllDevice = AsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userID } = req.params;
      const getUser = await UserModels.findById(userID);
      getUser!.loggedInDevice = []; // Clear the loggedInDevice array
      await getUser?.save();
      return res.status(HTTPCODES.OK).json({
        message: "Successfully Logout From All Device",
      });
    } catch (error: any) {
      if (error.path === "_id") {
        return res.status(HTTPCODES.NOT_FOUND).json({
          message: "User not found",
        });
      }
      return res.status(HTTPCODES.INTERNAL_SERVER_ERROR).json({
        message: "An Error Occurred in LogOutFromAllDevice",
        error: error,
      });
    }
  }
);

// User Update their account:
export const userUpdateAccount = AsyncHandler(
  async (req: any, res: Response, next: NextFunction) => {
    const { lastName, userName, middleName, address, phoneNumber } = req.body;

    const { userID } = req.params;

    const user = await UserModels.findById(userID);

    if (user) {
      const updateuser = await UserModels.findByIdAndUpdate(
        user?._id,
        { lastName, userName, middleName, address, phoneNumber },
        { new: true }
      );
      return res.status(HTTPCODES.ACCEPTED).json({
        message: "User Account Updated Successfully",
        data: updateuser?._id,
      });
    }

    try {
    } catch (error: any) {
      if (error.path === "_id") {
        return res.status(HTTPCODES.NOT_FOUND).json({
          message: "User not found. Sign up",
        });
      }
      return res.status(HTTPCODES.INTERNAL_SERVER_ERROR).json({
        message: "An Error Occured In UserBusinessRegistrationFlow3",
        error: error?.message,
      });
    }
  }
);

// Forget Password:
export const UserForgetPassword = AsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;

    const CheckEmailInDB = await UserModels.findOne({ email });

    const OTP = crypto.randomBytes(2).toString("hex");

    if (!CheckEmailInDB) {
      next(
        new MainAppError({
          message: "Email does not exist",
          httpcode: HTTPCODES.NOT_FOUND,
        })
      );
    } else {
      const upDateOTP = await UserModels.findByIdAndUpdate(
        CheckEmailInDB?._id,
        {
          OTP,
        },
        { new: true }
      );

      ForgetPasswordEmail(upDateOTP);
      return res.status(HTTPCODES.OK).json({
        message: "An OTP has been sent to your email",
        data: upDateOTP?.OTP,
      });
    }
  }
);

export const updateForgetPassword = AsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { OTP, password, confirmPassword } = req.body;

    const checkingOTP = await UserModels.findOne({ OTP });
    if (checkingOTP?.OTP !== OTP) {
      return next(
        new MainAppError({
          message: "Wrong OTP",
          httpcode: HTTPCODES.NOT_ACCEPTED,
        })
      );
    }
    if (password !== confirmPassword) {
      return next(
        new MainAppError({
          message: "Password Does not match",
          httpcode: HTTPCODES.GATEWAY_TIMEOUT,
        })
      );
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    await UserModels.findByIdAndUpdate(
      checkingOTP?._id,
      {
        password: hashedPassword,
        confirmPassword: hashedPassword,
        isVerified: true,
        OTP: "empty",
      },
      { new: true }
    );
    return res.status(HTTPCODES.OK).json({
      message: "Password Changed",
    });
  }
);

export const getALlUsers = AsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const getUser = await UserModels.find();

    return res.status(HTTPCODES.OK).json({
      message: "All users",
      dat: getUser,
    });
  }
);

// Top up your balance: that is transfer money from your bank to your account balance on your dashboard so you can use it for investment and savings: Using flutterwave as the payment gateway
export const UserTopUpBalance = AsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const GenerateTransactionReference = uuidv4();

    const { userID } = req.params;

    const user = await UserModels.findById(userID);

    const { topupamount } = req.body;

    const amount: number = parseInt(topupamount);

    if (user) {
      // Processing the top up balance with Flutterwave:
      const response = await fetch("https://api.flutterwave.com/v3/payments", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${EnvironmentVariables.SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tx_ref: GenerateTransactionReference,
          amount: `${amount}`,
          currency: "NGN",
          redirect_url: "https://firstcapital.vercel.app/",
          meta: {
            consumer_id: user?._id,
            // consumer_mac: "92a3-912ba-1192a",
          },
          customer: {
            email: user?.email,
            phonenumber: user?.phoneNumber,
            name: user?.lastName,
          },
          customizations: {
            title: "First Capital",
            logo: "https://firstcapital.vercel.app/assets/logo1-b9ccfcb5.png",
          },
        }),
      });

      if (response.ok) {
        const responseBody = await response.json();

        // Update the user available balance with the money they top up with:
        const UpdateUserBalance = await UserModels.findByIdAndUpdate(
          user?._id,
          {
            availableBalance: user?.availableBalance + amount,
          },
          { new: true }
        );

        // Create the transaction history of the user:
        const CreateTransactionHistory = await TransactionModels.create({
          message: `Dear ${user?.firstName}, you have top up your available balance with flutterwave`,
          amount: amount,
          TransactionReference: GenerateTransactionReference,
          TransactionType: "Credit",
          TransactionStatus: "Top Up Balance",
        });

        user?.transactions.push(
          new mongoose.Types.ObjectId(CreateTransactionHistory._id)
        );
        user?.save();

        return res.status(HTTPCODES.OK).json({
          message: "Transaction Successfull",
          datafromPayment: responseBody,
          TransactionHidstory: CreateTransactionHistory,
          UserAvailableBalance: UpdateUserBalance?.availableBalance,
        });
      } else {
        console.log(
          `Request was not successful. Status code: ${response.status}`
        );
      }
    } else {
      return next(
        new MainAppError({
          message: "User not found",
          httpcode: HTTPCODES.BAD_REQUEST,
        })
      );
    }
  }
);

// Setting up user transaction pin for payment
export const UserTransactionPin = AsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userID } = req.params;

      const user = await UserModels.findById(userID);

      const { transactionPin } = req.body;

      const salt = await bcrypt.genSalt(10);
      const hashedPin = await bcrypt.hash(transactionPin, salt);

      await UserModels.findByIdAndUpdate(
        user!._id,
        { transactionPin: hashedPin },
        { new: true }
      );

      return res.status(HTTPCODES.OK).json({
        message: "Pin set successfully",
      });
    } catch (error: any) {
      if (error.path === "_id") {
        return res.status(HTTPCODES.NOT_FOUND).json({
          message: "User not found.",
          error: error.message,
        });
      }
      return res.status(HTTPCODES.INTERNAL_SERVER_ERROR).json({
        message: "An Error Occurred in setting the transaction pin",
        error: error.message,
      });
    }
  }
);

// User Matured Investment Amount to withdraw
export const UserVerifyTheirAccountDetails = AsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userID } = req.params;

      const { account_number, account_bank } = req.body;

      const user = await UserModels.findById(userID);

      // if (user) {
      // verify the account details
      const response = await fetch(
        "https://api.flutterwave.com/v3/accounts/resolve",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${EnvironmentVariables.SECRET_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            account_number: account_number,
            account_bank: account_bank,
          }),
        }
      );

      if (response.ok) {
        const responseBody = await response.json();

        return res.status(HTTPCODES.OK).json({
          message: "Account details gotten",
          data: responseBody,
        });
      } else {
        return res.status(HTTPCODES.OK).json({
          message: "Err",
          err: response,
        });
      }
      // }
    } catch (error: any) {
      if (error.path === "_id") {
        return res.status(HTTPCODES.NOT_FOUND).json({
          message: "User not found.",
          error: error.message,
        });
      }
      return res.status(HTTPCODES.INTERNAL_SERVER_ERROR).json({
        message: "An Error Occurred in setting the transaction pin",
        error: error.message,
      });
    }
  }
);
import { NextFunction, Request, Response } from "express";
import { AsyncHandler } from "../Middlewares/AsyncHandler";
import { HTTPCODES, MainAppError } from "../Utils/MainAppError";
import bcrypt from "bcrypt";
import crypto from "crypto";
import UserModels from "../Models/UserModels";
import StaffModels from "../Models/StaffsModels";
import {
  ForgetPasswordEmail,
  UserLoginNotification,
  VerifyAccountByOTP,
  WelComeEmail,
} from "../email/UserEmail";
import mongoose from "mongoose";
import otpgenerator from "otp-generator";
import { v4 as uuidv4 } from "uuid";
import { EnvironmentVariables } from "../Config/EnvironmentVariables";
import TransactionModels from "../Models/TransactionModels";
import { addMinutes, isAfter } from "date-fns";
import { format } from "date-fns";

// User Registration
export const UsersRegistration = AsyncHandler(
  async (req: any, res: Response, next: NextFunction) => {
    const { firstName, phoneNumber, email, password, referralCode } = req.body;

    const token = crypto.randomBytes(48).toString("hex");

    const OTP = otpgenerator.generate(4, {
      upperCaseAlphabets: false,
      specialChars: false,
      digits: true,
      lowerCaseAlphabets: false,
    });

    const otpExpiryTimestamp = addMinutes(new Date(), 5);

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const findUser = await UserModels.findOne({ email });

    if (findUser) {
      return next(
        new MainAppError({
          message: "This account already exists",
          httpcode: HTTPCODES.FORBIDDEN,
        })
      );
    }

    const FindReferredStaff = await StaffModels.findOne({
      specialCode: referralCode,
    });

    if (referralCode === undefined) {
      const users = await UserModels.create({
        firstName,
        phoneNumber,
        email,
        role: "User",
        referredStaff: null,
        OTP,
        OTPExpiry: otpExpiryTimestamp,
        token,
        password: hashedPassword,
        confirmPassword: hashedPassword,
        isVerified: false,
        availableBalance: 0,
        totalSavingsAmount: 0,
        totalInvestmentAmount: 0,
        TopUpBalance: 0,
      });

      VerifyAccountByOTP(users);

      return res.status(201).json({
        message: "Successfully created User",
        data: users?._id,
      });
    } else if (!FindReferredStaff) {
      return next(
        new MainAppError({
          message: "Staff with this Referral Code does not exist",
          httpcode: HTTPCODES.FORBIDDEN,
        })
      );
    } else if (FindReferredStaff?.isVerified !== true) {
      return next(
        new MainAppError({
          message:
            "Staff is not verified. Cannot create an account with this code",
          httpcode: HTTPCODES.BAD_REQUEST,
        })
      );
    } else {
      const users = await UserModels.create({
        firstName,
        phoneNumber,
        email,
        role: "User",
        referredStaff: FindReferredStaff?.firstName,
        OTP,
        OTPExpiry: otpExpiryTimestamp,
        token,
        password: hashedPassword,
        confirmPassword: hashedPassword,
        isVerified: false,
        availableBalance: 0,
        totalInvestmentAmount: 0,
        totalSavingsAmount: 0,
        TopUpBalance: 0,
      });

      VerifyAccountByOTP(users);

      FindReferredStaff?.referrals.push(
        new mongoose.Types.ObjectId(users?._id)
      );
      FindReferredStaff?.save();

      return res.status(201).json({
        message: "Successfully created User",
        data: users?._id,
      });
    }
  }
);

// Resend OTP
export const resendOTP = AsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userID } = req.params;
    const getUser = await UserModels.findById(userID);

    const otpExpiryTimestamp = addMinutes(new Date(), 5);

    const generateNew = otpgenerator.generate(4, {
      upperCaseAlphabets: false,
      specialChars: false,
      digits: true,
      lowerCaseAlphabets: false,
    });
    if (getUser) {
      const User = await UserModels.findByIdAndUpdate(
        getUser?._id,
        {
          OTP: generateNew,
          OTPExpiry: otpExpiryTimestamp,
        },
        { new: true }
      );
      VerifyAccountByOTP(User);
      return res.status(HTTPCODES.OK).json({
        message: "OTP Sent",
      });
    } else {
      return next(
        new MainAppError({
          message: "Wrong OTP",
          httpcode: HTTPCODES.BAD_REQUEST,
        })
      );
    }
  }
);

// User Verification
export const UsersVerification = AsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { OTP } = req.body;
    const getUser = await UserModels.findOne({ OTP });

    if (getUser) {
      const currentTimestamp = new Date();
      const otpExpiry = new Date(getUser.OTPExpiry);

      if (isAfter(currentTimestamp, otpExpiry)) {
        return next(
          new MainAppError({
            message: "OTP has expired",
            httpcode: HTTPCODES.BAD_REQUEST,
          })
        );
      }

      const User = await UserModels.findByIdAndUpdate(
        getUser?._id,
        {
          OTP: "empty",
          isVerified: true,
        },
        { new: true }
      );
      WelComeEmail(getUser);
      return res.status(HTTPCODES.OK).json({
        message: "User Verification Successfull, proceed to Login",
      });
    } else {
      return next(
        new MainAppError({
          message: "Wrong OTP",
          httpcode: HTTPCODES.BAD_REQUEST,
        })
      );
    }
  }
);

// Users Login:
export const UsersLogin = AsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    const CheckUser = await UserModels.findOne({ email });

    if (!CheckUser) {
      return next(
        new MainAppError({
          message: "Email or password not correct",
          httpcode: HTTPCODES.CONFLICT,
        })
      );
    }
    const CheckPassword = await bcrypt.compare(password, CheckUser?.password!);
    if (!CheckPassword) {
      return next(
        new MainAppError({
          message: "Email or password not correct",
          httpcode: HTTPCODES.CONFLICT,
        })
      );
    }
    if (CheckUser?.isVerified && CheckUser?.OTP === "empty") {
      const GetDeviceName = req.get("User-Agent");
      const deviceExists = CheckUser.loggedInDevice.some(
        (device) => device.deviceName === GetDeviceName
      );

      if (!deviceExists) {
        const response = await fetch(
          "http://worldclockapi.com/api/json/utc/now"
        );
        const data = await response.json();
        const cloudTime = new Date(data.currentDateTime);

        const formattedDateTime = cloudTime.toLocaleString("en-US", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "numeric",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        });

        const logoInData = {
          deviceName: GetDeviceName,
          getTimeAndDate: formattedDateTime,
        };
        await CheckUser?.loggedInDevice?.push(logoInData);
        CheckUser?.save();
        UserLoginNotification(CheckUser, GetDeviceName, formattedDateTime);
        return res.status(HTTPCODES.OK).json({
          message: "User Login successfull",
          data: CheckUser?._id,
        });
      } else {
        return res.status(HTTPCODES.OK).json({
          message: "User Login successfull",
          data: CheckUser?._id,
        });
      }
    } else {
      return next(
        new MainAppError({
          message: "User not Verified",
          httpcode: HTTPCODES.NOT_FOUND,
        })
      );
    }
  }
);
export const LogOutFromAllDevice = AsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userID } = req.params;
      const getUser = await UserModels.findById(userID);
      getUser!.loggedInDevice = []; // Clear the loggedInDevice array
      await getUser?.save();
      return res.status(HTTPCODES.OK).json({
        message: "Successfully Logout From All Device",
      });
    } catch (error: any) {
      if (error.path === "_id") {
        return res.status(HTTPCODES.NOT_FOUND).json({
          message: "User not found",
        });
      }
      return res.status(HTTPCODES.INTERNAL_SERVER_ERROR).json({
        message: "An Error Occurred in LogOutFromAllDevice",
        error: error,
      });
    }
  }
);

// User Update their account:
export const userUpdateAccount = AsyncHandler(
  async (req: any, res: Response, next: NextFunction) => {
    const { lastName, userName, middleName, address, phoneNumber } = req.body;

    const { userID } = req.params;

    const user = await UserModels.findById(userID);

    if (user) {
      const updateuser = await UserModels.findByIdAndUpdate(
        user?._id,
        { lastName, userName, middleName, address, phoneNumber },
        { new: true }
      );
      return res.status(HTTPCODES.ACCEPTED).json({
        message: "User Account Updated Successfully",
        data: updateuser?._id,
      });
    }

    try {
    } catch (error: any) {
      if (error.path === "_id") {
        return res.status(HTTPCODES.NOT_FOUND).json({
          message: "User not found. Sign up",
        });
      }
      return res.status(HTTPCODES.INTERNAL_SERVER_ERROR).json({
        message: "An Error Occured In UserBusinessRegistrationFlow3",
        error: error?.message,
      });
    }
  }
);

// Forget Password:
export const UserForgetPassword = AsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;

    const CheckEmailInDB = await UserModels.findOne({ email });

    const OTP = crypto.randomBytes(2).toString("hex");

    if (!CheckEmailInDB) {
      next(
        new MainAppError({
          message: "Email does not exist",
          httpcode: HTTPCODES.NOT_FOUND,
        })
      );
    } else {
      const upDateOTP = await UserModels.findByIdAndUpdate(
        CheckEmailInDB?._id,
        {
          OTP,
        },
        { new: true }
      );

      ForgetPasswordEmail(upDateOTP);
      return res.status(HTTPCODES.OK).json({
        message: "An OTP has been sent to your email",
        data: upDateOTP?.OTP,
      });
    }
  }
);

export const updateForgetPassword = AsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { OTP, password, confirmPassword } = req.body;

    const checkingOTP = await UserModels.findOne({ OTP });
    if (checkingOTP?.OTP !== OTP) {
      return next(
        new MainAppError({
          message: "Wrong OTP",
          httpcode: HTTPCODES.NOT_ACCEPTED,
        })
      );
    }
    if (password !== confirmPassword) {
      return next(
        new MainAppError({
          message: "Password Does not match",
          httpcode: HTTPCODES.GATEWAY_TIMEOUT,
        })
      );
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    await UserModels.findByIdAndUpdate(
      checkingOTP?._id,
      {
        password: hashedPassword,
        confirmPassword: hashedPassword,
        isVerified: true,
        OTP: "empty",
      },
      { new: true }
    );
    return res.status(HTTPCODES.OK).json({
      message: "Password Changed",
    });
  }
);

export const getALlUsers = AsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const getUser = await UserModels.find();

    return res.status(HTTPCODES.OK).json({
      message: "All users",
      dat: getUser,
    });
  }
);

// Top up your balance: that is transfer money from your bank to your account balance on your dashboard so you can use it for investment and savings: Using flutterwave as the payment gateway
export const UserTopUpBalance = AsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const GenerateTransactionReference = uuidv4();

    const { userID } = req.params;

    const user = await UserModels.findById(userID);

    const { topupamount } = req.body;

    const amount: number = parseInt(topupamount);

    if (user) {
      // Processing the top up balance with Flutterwave:
      const response = await fetch("https://api.flutterwave.com/v3/payments", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${EnvironmentVariables.SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tx_ref: GenerateTransactionReference,
          amount: `${amount}`,
          currency: "NGN",
          redirect_url: "https://firstcapital.vercel.app/",
          meta: {
            consumer_id: user?._id,
            // consumer_mac: "92a3-912ba-1192a",
          },
          customer: {
            email: user?.email,
            phonenumber: user?.phoneNumber,
            name: user?.lastName,
          },
          customizations: {
            title: "First Capital",
            logo: "https://firstcapital.vercel.app/assets/logo1-b9ccfcb5.png",
          },
        }),
      });

      if (response.ok) {
        const responseBody = await response.json();

        // Update the user available balance with the money they top up with:
        const UpdateUserBalance = await UserModels.findByIdAndUpdate(
          user?._id,
          {
            availableBalance: user?.availableBalance + amount,
          },
          { new: true }
        );

        // Create the transaction history of the user:
        const CreateTransactionHistory = await TransactionModels.create({
          message: `Dear ${user?.firstName}, you have top up your available balance with flutterwave`,
          amount: amount,
          TransactionReference: GenerateTransactionReference,
          TransactionType: "Credit",
          TransactionStatus: "Top Up Balance",
        });

        user?.transactions.push(
          new mongoose.Types.ObjectId(CreateTransactionHistory._id)
        );
        user?.save();

        return res.status(HTTPCODES.OK).json({
          message: "Transaction Successfull",
          datafromPayment: responseBody,
          TransactionHidstory: CreateTransactionHistory,
          UserAvailableBalance: UpdateUserBalance?.availableBalance,
        });
      } else {
        console.log(
          `Request was not successful. Status code: ${response.status}`
        );
      }
    } else {
      return next(
        new MainAppError({
          message: "User not found",
          httpcode: HTTPCODES.BAD_REQUEST,
        })
      );
    }
  }
);

// Setting up user transaction pin for payment
export const UserTransactionPin = AsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userID } = req.params;

      const user = await UserModels.findById(userID);

      const { transactionPin } = req.body;

      const salt = await bcrypt.genSalt(10);
      const hashedPin = await bcrypt.hash(transactionPin, salt);

      await UserModels.findByIdAndUpdate(
        user!._id,
        { transactionPin: hashedPin },
        { new: true }
      );

      return res.status(HTTPCODES.OK).json({
        message: "Pin set successfully",
      });
    } catch (error: any) {
      if (error.path === "_id") {
        return res.status(HTTPCODES.NOT_FOUND).json({
          message: "User not found.",
          error: error.message,
        });
      }
      return res.status(HTTPCODES.INTERNAL_SERVER_ERROR).json({
        message: "An Error Occurred in setting the transaction pin",
        error: error.message,
      });
    }
  }
);

// User Matured Investment Amount to withdraw
export const UserVerifyTheirAccountDetails = AsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userID } = req.params;

      const { account_number, account_bank } = req.body;

      const user = await UserModels.findById(userID);

      // if (user) {
      // verify the account details
      const response = await fetch(
        "https://api.flutterwave.com/v3/accounts/resolve",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${EnvironmentVariables.SECRET_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            account_number: account_number,
            account_bank: account_bank,
          }),
        }
      );

      if (response.ok) {
        const responseBody = await response.json();

        return res.status(HTTPCODES.OK).json({
          message: "Account details gotten",
          data: responseBody,
        });
      } else {
        return res.status(HTTPCODES.OK).json({
          message: "Err",
          err: response,
        });
      }
      // }
    } catch (error: any) {
      if (error.path === "_id") {
        return res.status(HTTPCODES.NOT_FOUND).json({
          message: "User not found.",
          error: error.message,
        });
      }
      return res.status(HTTPCODES.INTERNAL_SERVER_ERROR).json({
        message: "An Error Occurred in setting the transaction pin",
        error: error.message,
      });
    }
  }
);
