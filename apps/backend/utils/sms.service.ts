import axios from "axios";

type AuthKeyTemplateInputs = {
  login_otp_self: { otp: string; school: string };
  login_otp_student: {
    otp: string;
    school: string;
    student: string;
  };
  change_phone_otp_old: {
    otp: string;
    newphone: string;
  };
  change_phone_otp_new: {
    otp: string;
  };
};

const AuthKeyTemplateIDs: Record<keyof AuthKeyTemplateInputs, number> = {
  login_otp_self: 7471,
  login_otp_student: 7472,
  change_phone_otp_old: 9245,
  change_phone_otp_new: 9246,
};

export async function sendSMS<T extends keyof AuthKeyTemplateInputs>(
  phoneNumber: string | { isd?: number; number: string },
  template: T,
  params: AuthKeyTemplateInputs[T],
) {
  // Prepare destination
  const mobile =
    typeof phoneNumber === "string" ? phoneNumber : phoneNumber.number;
  const country_code =
    (typeof phoneNumber === "string" ? 91 : phoneNumber.isd) ?? 91;

  // Trim template variable length at 30, otherwise DLT will fail
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === "string") {
      const processedVal = value.trim().slice(0, 30);

      // @ts-expect-error It won't error, we are just populating the params here
      params[key] = processedVal;
    }
  }

  // Prepare template
  const templateId = AuthKeyTemplateIDs[template];

  // Don't Send SMS in non-prod envs
  if (process.env.NODE_ENV === "production") {
    const { data } = await axios.get(`https://api.authkey.io/request`, {
      params: {
        authkey: process.env.AUTHKEYIO_KEY,
        mobile,
        country_code,
        sid: templateId,
        ...params,
      },
    });

    console.log("AuthKey.io response:", data);
  } else {
    console.log(
      `[${process.env.NODE_ENV}] Actual SMS won't be sent to +${country_code}-${mobile}`,
      {
        params,
        templateId,
      },
    );
  }
}
