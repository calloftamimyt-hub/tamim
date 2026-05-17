export const TELEGRAM_BOT_TOKEN = '8807931968:AAFBGFkNQdy1juHrNsKBN_oNH_OJg5uQERQ';
export const TELEGRAM_BOT_USERNAME = 'halalcircleguardian_bot';

export const getTelegramLink = (verifyCode: string) => {
  return `https://t.me/${TELEGRAM_BOT_USERNAME}?start=${verifyCode}`;
};

export const verifyTelegramConnection = async (verifyCode: string) => {
  try {
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getUpdates`);
    const data = await response.json();
    
    if (data.ok) {
      // Look for the message with the verify code
      const updates = data.result || [];
      for (const update of updates) {
        if (update.message && update.message.text && update.message.text.includes(verifyCode)) {
          return update.message.chat.id.toString();
        }
      }
    }
    return null;
  } catch (error) {
    console.error("Error connecting to Telegram:", error);
    return null;
  }
};

export const sendTelegramMessage = async (chatId: string, message: string) => {
  if (!chatId) return null;
  try {
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML'
      }),
    });
    return await response.json();
  } catch (error) {
    console.error("Error sending Telegram message:", error);
    return null;
  }
};
