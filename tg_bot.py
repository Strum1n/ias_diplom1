import logging
import asyncio
from datetime import datetime
from telegram.ext import Application, ContextTypes

# Настройка логирования
logging.basicConfig(format="%(asctime)s - %(name)s - %(levelname)s - %(message)s", level=logging.INFO)
logger = logging.getLogger(__name__)

# Токен вашего бота
TOKEN = "8502736845:AAErJa3ksUblb695Q025UhFyjy2j37K5pI0"

# Ваш Telegram ID
YOUR_USER_ID = 712661922  # ЗАМЕНИТЕ НА СВОЙ ID


# Функция отправки уведомлений
async def send_notification(context: ContextTypes.DEFAULT_TYPE):
    current_time = datetime.now().strftime("%H:%M:%S")
    try:
        await context.bot.send_message(chat_id=YOUR_USER_ID, text=f"🔔 Уведомление [{current_time}]")
        logger.info(f"Уведомление отправлено в {current_time}")
    except Exception as e:
        logger.error(f"Ошибка отправки: {e}")


async def startup_notification(app: Application):
    """Отправляет уведомление о запуске бота"""
    await asyncio.sleep(3)  # Небольшая задержка для инициализации
    try:
        await app.bot.send_message(chat_id=YOUR_USER_ID, text="🚀 Бот запущен и будет присылать уведомления каждые 5 минут!")
        logger.info("Стартовое уведомление отправлено")
    except Exception as e:
        logger.error(f"Ошибка отправки стартового уведомления: {e}")


def main():
    application = Application.builder().token(TOKEN).build()

    # Запускаем уведомления сразу
    job_queue = application.job_queue
    job_queue.run_repeating(
        send_notification,
        interval=300,  # 5 минут
        first=10,  # первое через 10 секунд
    )

    # Отправляем уведомление о запуске
    import asyncio

    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    loop.create_task(startup_notification(application))

    print(f"🤖 Бот запущен и отправляет уведомления пользователю {YOUR_USER_ID}")
    print("⏱️ Уведомления каждые 5 минут")
    print("📝 Для остановки нажмите Ctrl+C")

    application.run_polling(allowed_updates=[])


if __name__ == "__main__":
    main()
