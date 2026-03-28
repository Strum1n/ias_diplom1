#!/bin/bash
echo "========================================="
echo "Starting database restore..."
echo "========================================="
echo "Current date: $(date)"
echo "Files in /backup:"
ls -la /backup/

# Ждем готовности базы данных
echo "Waiting for PostgreSQL to accept connections..."
for i in {1..30}; do
    if pg_isready -U postgres -d diplom_db > /dev/null 2>&1; then
        echo "PostgreSQL is ready!"
        break
    fi
    sleep 1
done

# Проверяем, нужно ли восстанавливать
TABLE_COUNT=$(psql -U postgres -d diplom_db -t -c "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public'" 2>/dev/null | xargs)

echo "Current tables in database: ${TABLE_COUNT:-0}"

if [ "${TABLE_COUNT:-0}" = "0" ]; then
    echo "========================================="
    echo "Database is empty. Starting restore..."
    echo "========================================="
    
    # Выполняем восстановление
    if pg_restore -U postgres -d diplom_db -v /backup/db_backup.dump 2>&1; then
        echo "========================================="
        echo "✅ Restore completed successfully!"
        echo "========================================="
        
        # Проверяем результат
        NEW_COUNT=$(psql -U postgres -d diplom_db -t -c "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public'" | xargs)
        echo "Tables after restore: $NEW_COUNT"
    else

        echo "You can restore manually with:"
        echo "docker exec -it postgres_db pg_restore -U postgres -d diplom_db -v /backup/db_backup.dump"
    fi
else
    echo "Database already has $TABLE_COUNT tables. Skipping restore."
fi

echo "========================================="
echo "Restore script finished at $(date)"
echo "========================================="

# Важно: выходим с кодом 0, чтобы не вызвать ошибку
exit 0