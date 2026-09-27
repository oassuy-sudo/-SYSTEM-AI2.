/**
 * SYSTEM/AI — приём заявок с сайта
 * Что делает: записывает заявку в текущую таблицу и присылает уведомление в Telegram.
 *
 * УСТАНОВКА (делается один раз):
 * 1. Создай новую Google-таблицу (sheets.new).
 * 2. В таблице: Расширения → Apps Script.
 * 3. Сотри код-заглушку, вставь весь этот файл целиком.
 * 4. Впиши свои значения в TELEGRAM_BOT_TOKEN и TELEGRAM_CHAT_ID ниже (как получить — см. инструкцию в чате).
 * 5. Deploy → New deployment → тип "Web app".
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 6. Скопируй выданный URL (кончается на /exec) — это и есть SCRIPT_URL для сайта.
 * 7. При первом деплое Google спросит разрешения — подтверди (это твой же скрипт).
 */

const TELEGRAM_BOT_TOKEN = 'ВСТАВЬ_ТОКЕН_БОТА'; // получишь у @BotFather
const TELEGRAM_CHAT_ID = '725723757';       // получишь у @userinfobot (или см. инструкцию)

function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = JSON.parse(e.postData.contents);

  // Если это первая заявка — добавим заголовки
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['Дата', 'Имя', 'Контакт', 'Сообщение']);
  }

  const now = new Date();
  sheet.appendRow([now, data.name || '', data.contact || '', data.message || '']);

  // Уведомление в Telegram (если токен указан)
  if (TELEGRAM_BOT_TOKEN && !TELEGRAM_BOT_TOKEN.includes('ВСТАВЬ')) {
    const text =
      '🆕 Новая заявка с сайта\n\n' +
      'Имя: ' + (data.name || '—') + '\n' +
      'Контакт: ' + (data.contact || '—') + '\n' +
      'Сообщение: ' + (data.message || '—');

    UrlFetchApp.fetch(
      'https://api.telegram.org/bot' + TELEGRAM_BOT_TOKEN + '/sendMessage',
      {
        method: 'post',
        contentType: 'application/json',
        payload: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: text }),
        muteHttpExceptions: true
      }
    );
  }

  return ContentService.createTextOutput(JSON.stringify({ status: 'ok' }))
    .setMimeType(ContentService.MimeType.JSON);
}
