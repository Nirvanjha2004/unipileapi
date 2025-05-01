const express = require("express");
const axios = require("axios");

const app = express();
const PORT = 3000;

// Add body-parser middleware to parse JSON request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post(
  "/trigger-webhook",
  async (
    req: any,
    res: {
      status: (arg0: number) => {
        (): any;
        new (): any;
        json: {
          (arg0: { message?: string; data?: any; error?: string }): void;
          new (): any;
        };
      };
    }
  ) => {
    try {
      const response = await axios.post(
        "https://api12.unipile.com:14202/api/v1/webhooks",
        {
          request_url: "https://endpoint",
          source: "messaging",
          headers: [
            {
              key: "Content-Type",
              value: "application/json",
            },
          ],
        },
        {
          headers: {
            "X-API-KEY":
              "hmDxTD5V.1BZyh0/cTeyKf1MGo8mmotVl6HqDhZ1wE27jHSQCUSI=",
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );

      res.status(200).json({ message: "Webhook sent", data: response.data });
    } catch (error) {
      console.error("Error sending webhook:", error);
      res.status(500).json({ error: "Failed to send webhook" });
    }
  }
);

app.post(
  "/accountstatus",
  (
    req: {
      body: {
        AccountStatus: {
          account_id: string;
          message: string;
          account_type: string;
        };
      };
    },
    res: { sendStatus: (arg0: number) => void }
  ) => {
    const { AccountStatus } = req.body;

    console.log("Webhook received:", AccountStatus);

    switch (AccountStatus.message) {
      case "OK":
        console.log(
          `✅ [${AccountStatus.account_type}] Account ${AccountStatus.account_id} is healthy and operational.`
        );
        break;

      case "ERROR / STOPPED":
        console.error(
          `❌ [${AccountStatus.account_type}] Account ${AccountStatus.account_id} synchronization stopped due to error. Check credentials or rate limits.`
        );
        break;

      case "CREDENTIALS":
        console.warn(
          `⚠️ [${AccountStatus.account_type}] Account ${AccountStatus.account_id} has credential issues (expired session, proxy timeout, etc).`
        );
        break;

      case "CONNECTING":
        console.log(
          `🔄 [${AccountStatus.account_type}] Account ${AccountStatus.account_id} is attempting to connect...`
        );
        break;

      case "DELETED":
        console.log(
          `🗑️ [${AccountStatus.account_type}] Account ${AccountStatus.account_id} has been deleted.`
        );
        break;

      case "CREATION_SUCCESS":
        console.log(
          `🎉 [${AccountStatus.account_type}] Account ${AccountStatus.account_id} was successfully created and synced.`
        );
        break;

      case "RECONNECTED":
        console.log(
          `🔌 [${AccountStatus.account_type}] Account ${AccountStatus.account_id} has been reconnected successfully.`
        );
        break;

      case "SYNC_SUCCESS":
        console.log(
          `🔁 [${AccountStatus.account_type}] Account ${AccountStatus.account_id} has successfully finished resynchronization.`
        );
        break;

      default:
        console.log(
          `ℹ️ [${AccountStatus.account_type}] Account ${AccountStatus.account_id} returned unhandled status: ${AccountStatus.message}`
        );
        break;
    }

    res.sendStatus(200); // Respond to Unipile
  }
);

app.post(
  "/messagestatus",
  (req: any, res: { sendStatus: (arg0: number) => void }) => {
    console.log("Message webhook received");

    // Check if we have a body at all
    if (!req.body) {
      console.log("Warning: Request body is undefined");
      res.sendStatus(200);
      return;
    }

    // First log the full body for debugging
    console.log("Webhook body:", JSON.stringify(req.body, null, 2));

    //   try {
    //     // More defensive checking for properties
    //     if (req.body && req.body.event && req.body.event.includes('message')) {
    //       // Extract message data from the proper location in the payload
    //       const messageData = req.body.data || req.body.message;

    //       if (messageData) {
    //         console.log('Message details:');
    //         console.log(`- From: ${messageData.from || messageData.sender_id || 'Unknown sender'}`);
    //         console.log(`- Content: ${messageData.content || messageData.text || messageData.body || 'No content'}`);
    //         console.log(`- Timestamp: ${messageData.timestamp || messageData.created_at || new Date().toISOString()}`);
    //       } else {
    //         console.log('Message data is unavailable in the webhook payload');
    //         console.log('Payload structure:', Object.keys(req.body));
    //       }
    //     } else {
    //       // If we can't find an event property, let's just log what we do have
    //       console.log('Could not find expected event property');
    //       console.log('Available properties:', req.body ? Object.keys(req.body) : 'None');
    //     }
    //   } catch (error) {
    //     console.error('Error processing webhook:', error);
    //   }

    // Always respond with 200 OK to acknowledge receipt
    res.sendStatus(200);
  }
);

app.get(
  "/",
  (
    req: any,
    res: {
      status: (arg0: number) => {
        (): any;
        new (): any;
        json: { (arg0: { message: string }): void; new (): any };
      };
    }
  ) => {
    console.log("hithere");
    res.status(200).json({ message: "Server is live" });
  }
);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
