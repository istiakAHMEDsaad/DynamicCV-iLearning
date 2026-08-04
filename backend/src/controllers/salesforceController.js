import prisma from "../configs/prisma.js";
import axios from "axios";

export const syncProfileToSalesforce = async (req, res) => {
  const userId = req.user.userId;
  const { companyName, phone, jobTitle } = req.body;

  try {
    if (!companyName) {
      return res
        .status(400)
        .json({ error: "Company/Account Name is required." });
    }

    const profile = await prisma.profile.findUnique({
      where: { userId },
      include: { user: true },
    });

    if (!profile) {
      return res.status(404).json({ error: "Profile not found." });
    }

    const tokenParams = new URLSearchParams({
      grant_type: "password",
      client_id: process.env.SF_CLIENT_ID,
      client_secret: process.env.SF_CLIENT_SECRET,
      username: process.env.SF_USERNAME,
      password: process.env.SF_PASSWORD + process.env.SF_SECURITY_TOKEN,
    });

    const authResponse = await axios.post(
      "https://login.salesforce.com/services/oauth2/token",
      tokenParams,
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      },
    );

    const { access_token, instance_url } = authResponse.data;
    const authHeaders = {
      headers: { Authorization: `Bearer ${access_token}` },
    };

    const accountResponse = await axios.post(
      `${instance_url}/services/data/v60.0/sobjects/Account`,
      {
        Name: companyName,
        Phone: phone,
      },
      authHeaders,
    );

    const accountId = accountResponse.data.id;

    const contactResponse = await axios.post(
      `${instance_url}/services/data/v60.0/sobjects/Contact`,
      {
        FirstName: profile.user.firstName,
        LastName: profile.user.lastName,
        Email: profile.user.email,
        Title: jobTitle,
        Phone: phone,
        AccountId: accountId,
      },
      authHeaders,
    );

    return res.status(200).json({
      success: true,
      message: "Profile successfully synced to Salesforce!",
      accountId: accountId,
      contactId: contactResponse.data.id,
    });
  } catch (error) {
    console.error(
      "Salesforce Sync Error:",
      error?.response?.data || error.message,
    );
    return res
      .status(500)
      .json({
        error:
          "Failed to sync with Salesforce CRM. Check server logs and credentials.",
      });
  }
};
