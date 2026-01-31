// Slack webhook handler for Maven bot
// This handles app_mention events and triggers Make workflow

export default async function handler(req, res) {
  // Handle Slack URL verification challenge
  if (req.body && req.body.challenge) {
    console.log('Responding to Slack challenge');
    return res.status(200).json({ challenge: req.body.challenge });
  }

  // Handle app_mention events
  if (req.body && req.body.event && req.body.event.type === 'app_mention') {
    const text = req.body.event.text;
    const user = req.body.event.user;
    const channel = req.body.event.channel;
    const messageTs = req.body.event.ts;

    console.log('Received app_mention:', { text, user, channel });

    // Check if message contains Grain URL
    if (text.includes('grain.com')) {
      // Extract Grain URL using regex
      const grainUrlMatch = text.match(/https:\/\/grain\.com\/share\/recording\/[^\s>]+/);

      if (grainUrlMatch) {
        const grainUrl = grainUrlMatch[0];
        console.log('Found Grain URL:', grainUrl);

        // TODO: Replace with your actual Make webhook URL
        const makeWebhookUrl = 'https://hook.us1.make.com/ztb1ogj7xxsi7wba66fseid9wp79nedy';

        try {
          // Trigger Make webhook
          const response = await fetch(makeWebhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              grain_url: grainUrl,
              slack_user: user,
              slack_channel: channel,
              slack_message_ts: messageTs,
              original_text: text
            })
          });

          console.log('Make webhook triggered:', response.status);
        } catch (error) {
          console.error('Error triggering Make webhook:', error);
        }
      } else {
        console.log('No valid Grain URL found in message');
      }
    }
  }

  // Always return 200 OK to acknowledge receipt
  return res.status(200).send('OK');
}
